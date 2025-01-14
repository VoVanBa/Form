import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismasurveyFeedbackRepository } from 'src/repositories/prisma-form.repository';
import { PrismaUserResponseRepository } from 'src/repositories/prisma-user-response.repository';
import { PrismaResponseQuestionRepository } from 'src/repositories/prisma-response-question.repository';
import { CreateResponseOnQuestionDto } from './dtos/create.response.on.question.dto';
import { PrismaQuestionRepository } from 'src/repositories/prisma-question.repository';
import { ResponseDto } from './dtos/response.dto';
import { QuestionSetting } from './dtos/question.setting.dto';

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
    userId?: number, // userId is optional
  ) {
    const { guestData, responses } = createResponse;

    // Lấy form hiện tại
    const existingForm =
      await this.formRepository.getsurveyFeedbackById(formId);
    if (!existingForm) {
      throw new BadRequestException('Survey not found for this business');
    }

    // Lấy cấu hình câu hỏi từ form
    const questionSettings =
      await this.questionRepository.getSettingByFormId(formId);

    console.log(questionSettings);

    // Gọi validateResponses
    const validationErrors = await this.validateResponses(
      responses,
      questionSettings,
    );
    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors);
    }

    // Tạo phản hồi của người dùng
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
          // Chỉ kiểm tra giá trị của range
          if (
            response.ratingValue &&
            response.ratingValue.toString() !== questionSettings.range &&
            response.ratingValue < 0
          ) {
            errors.push(
              `Question ID ${response.questionId} rating value must be ${questionSettings.range}.`,
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
}
