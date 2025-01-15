import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismasurveyFeedbackRepository } from 'src/repositories/prisma-form.repository';
import { PrismaUserResponseRepository } from 'src/repositories/prisma-user-response.repository';
import { PrismaResponseQuestionRepository } from 'src/repositories/prisma-response-question.repository';
import { CreateResponseOnQuestionDto } from './dtos/create.response.on.question.dto';
import { PrismaQuestionRepository } from 'src/repositories/prisma-question.repository';
import { ResponseDto } from './dtos/response.dto';
import { QuestionSetting } from './dtos/question.setting.dto';
import { count } from 'console';
import { SurveyResponse } from 'src/responses/user-responses.response';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ResponseSurveyService {
  constructor(
    private formRepository: PrismasurveyFeedbackRepository,
    private userResponseRepository: PrismaUserResponseRepository,
    private responseQuestionRepository: PrismaResponseQuestionRepository,
    private questionRepository: PrismaQuestionRepository,
  ) {}
  async saveGuestInfoAndResponses(
    businessId: number,
    formId: number,
    createResponse: CreateResponseOnQuestionDto,
    userId?: number,
  ) {
    const { guestData, responses } = createResponse;

    const existingForm =
      await this.formRepository.getsurveyFeedbackById(formId);
    if (!existingForm) {
      throw new BadRequestException('Survey not found for this business');
    }

    const questionSettings =
      await this.questionRepository.getSettingByFormId(formId);

    console.log(questionSettings);

    const validationErrors = await this.validateResponses(
      responses,
      questionSettings,
    );
    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors);
    }

    const userSurveyResponse = await this.userResponseRepository.create(
      existingForm.id,
      guestData,
      userId || null,
    );

    // Lưu các câu trả lời
    const responsePromises = responses.map((response) => {
      const { questionId, answerOptionId, answerText, ratingValue } = response;

      if (Array.isArray(answerOptionId)) {
        return Promise.all(
          answerOptionId.map((optionId) =>
            this.responseQuestionRepository.create(
              questionId,
              optionId,
              userSurveyResponse.id,
              answerText,
              ratingValue,
              existingForm.id,
            ),
          ),
        );
      } else {
        return this.responseQuestionRepository.create(
          questionId,
          answerOptionId,
          userSurveyResponse.id,
          answerText,
          ratingValue,
          existingForm.id,
        );
      }
    });

    await Promise.all(responsePromises);
  }

  async saveGuestInfoAndResponsesAllowAnonymous(
    businessId: number,
    formId: number,
    createResponse: CreateResponseOnQuestionDto,
  ) {
    return this.saveGuestInfoAndResponses(businessId, formId, createResponse);
  }

  async saveGuestInfoAndResponsesNotAllowAnonymous(
    businessId: number,
    formId: number,
    createResponse: CreateResponseOnQuestionDto,
    userId: number,
  ) {
    return this.saveGuestInfoAndResponses(
      businessId,
      formId,
      createResponse,
      userId,
    );
  }

  async validateResponses(
    responses: ResponseDto[],
    settings: QuestionSetting[],
  ) {
    const errors: string[] = [];

    responses.forEach((response) => {
      const questionSetting = settings.find(
        (setting) => setting.key === response.questionType,
      );

      if (!questionSetting) {
        errors.push(`No settings found for question ID ${response.questionId}`);
        return;
      }

      const { settings: questionSettings } = questionSetting;

      // Kiểm tra nếu câu hỏi là bắt buộc
      if (
        questionSettings.require &&
        !response.answerText &&
        !response.answerOptionId &&
        response.ratingValue === undefined
      ) {
        errors.push(
          `Question ID ${response.questionId} is required but not answered.`,
        );
        return;
      }

      // Kiểm tra loại câu hỏi
      switch (response.questionType) {
        case 'SINGLE_CHOICE':
        case 'PICTURE_SELECTION':
          if (questionSettings.require && !response.answerOptionId) {
            errors.push(
              `Question ID ${response.questionId} requires an answer.`,
            );
          }
          break;

        case 'MULTI_CHOICE':
          if (response.answerOptionId) {
            if (
              response.answerOptionId.length <
              (questionSettings.minSelections || 1)
            ) {
              errors.push(
                `Question ID ${response.questionId} requires at least ${questionSettings.minSelections} selections.`,
              );
            }
            if (
              response.answerOptionId.length >
              (questionSettings.maxSelections || Infinity)
            ) {
              errors.push(
                `Question ID ${response.questionId} allows a maximum of ${questionSettings.maxSelections} selections.`,
              );
            }
          } else if (questionSettings.require) {
            errors.push(
              `Question ID ${response.questionId} requires at least one selection.`,
            );
          }
          break;

        case 'INPUT_TEXT':
          if (questionSettings.require && !response.answerText) {
            errors.push(
              `Question ID ${response.questionId} requires an input text.`,
            );
          }
          break;

        case 'RATING_SCALE':
          if (
            questionSettings.isRequired &&
            response.ratingValue === undefined
          ) {
            errors.push(
              `Question ID ${response.questionId} requires a rating value.`,
            );
          }

          if (
            response.ratingValue !== undefined &&
            (response.ratingValue > parseFloat(questionSettings.range) ||
              response.ratingValue <= 0)
          ) {
            errors.push(
              `Question ID ${response.questionId}: Rating value must be between 0 and ${questionSettings.range}.`,
            );
          }

          break;

        default:
          errors.push(
            `Unknown question type for question ID ${response.questionId}.`,
          );
      }
    });

    return errors;
  }

  async getDetailedSurveyResponses(formId: number): Promise<any> {
    const totalResponses =
      await this.responseQuestionRepository.totalResponses(formId);

    const questions = await this.responseQuestionRepository.getAll(formId);

    const detailedResponses = questions.map((question) => {
      const responses = [];
      let totalQuestionResponses = 0;

      if (
        question.questionType === 'SINGLE_CHOICE' ||
        question.questionType === 'MULTI_CHOICE' ||
        question.questionType === 'PICTURE_SELECTION'
      ) {
        const totalQuestion = question.responseOnQuestions.length;

        question.answerOptions.forEach((option) => {
          const count = question.responseOnQuestions.filter(
            (response) => response.answerOptionId === option.id,
          ).length;

          responses.push({
            id: option.id,
            label: option.label,
            count,
            percentage: ((count / totalQuestion) * 100).toFixed(2) || 0,
          });
        });
        totalQuestionResponses = totalQuestion;
      } else if (question.questionType === 'RATING_SCALE') {
        const configurations = question.businessQuestionConfiguration;
        console.log(configurations);

        let range = 0;
        if (Array.isArray(configurations)) {
          const rangeSetting = configurations.find((config) => {
            const settings = config.settings as any;
            return parseInt(settings.range);
          });

          console.log(rangeSetting, 'rangeSetting');

          if (rangeSetting) {
            const settings = rangeSetting.settings as any;
            range = parseInt(settings.range);
          }
        }

        console.log(range, 'range');

        const ratingCounts = Array(range).fill(0);

        question.responseOnQuestions.forEach((response) => {
          if (
            response.ratingValue &&
            response.ratingValue >= 1 &&
            response.ratingValue <= range
          ) {
            ratingCounts[response.ratingValue - 1]++;
            totalQuestionResponses++;
          }
        });

        for (let i = 0; i < range; i++) {
          responses.push({
            label: `${i + 1}`,
            count: ratingCounts[i],
            percentage:
              ((ratingCounts[i] / totalQuestionResponses) * 100).toFixed(2) ||
              0,
          });
        }
      } else if (question.questionType === 'INPUT_TEXT') {
        const texts = question.responseOnQuestions
          .filter((response) => response.answerText)
          .map((response) => response.answerText);

        responses.push(...texts.map((text) => ({ answerText: text })));
        totalQuestionResponses = responses.length;
      }

      return {
        questionId: question.id,
        type: question.questionType,
        headline: question.headline,
        responses,
        totalQuestionResponses,
      };
    });

    return {
      totalResponses,
      questions: detailedResponses,
    };
  }

  async getUserResponse(formId: number) {
    const form = await this.formRepository.getsurveyFeedbackById(formId);

    if (!form) {
      throw new BadRequestException('Survey not found');
    }

    const surveyResponseQuestions =
      await this.userResponseRepository.getUserResponse(formId);

    return surveyResponseQuestions;
  }
  async getDetailResponesFromUser(formId: number) {
    const existingForm =
      await this.formRepository.getsurveyFeedbackById(formId);
    if (!existingForm) {
      throw new BadRequestException('Survey not found for this business');
    }
    const userResponses =
      await this.userResponseRepository.getDetailResponesFromUser(formId);
    const formattedData = userResponses.map((userResponse) => ({
      userId: userResponse.userId,
      guest: {
        name: (userResponse.guest as { name: string }).name, // Ép kiểu JSON thành kiểu có cấu trúc
        address: (userResponse.guest as { address: string }).address,
        phoneNumber: (userResponse.guest as { phoneNumber: string })
          .phoneNumber,
      },
      responseOnQuestions: userResponse.responseOnQuestions.map((response) => ({
        questionId: response.question.id,
        headline: response.question.headline,
        questionType: response.question.questionType,
        answerText: response.answerText,
        ratingValue: response.ratingValue,
        answerOptions: response.question.answerOptions.map((option) => ({
          answerOptionId: option.id,
          value: option.label,
        })),
      })),
    }));

    return plainToInstance(
      SurveyResponse,
      { formId, userResponses: formattedData },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
