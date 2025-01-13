import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismasurveyFeedbackRepository } from 'src/repositories/prisma-form.repository';
import { PrismaUserResponseRepository } from 'src/repositories/prisma-user-response.repository';
import { PrismaResponseQuestionRepository } from 'src/repositories/prisma-response-question.repository';
import { CreateResponseOnQuestionDto } from './dtos/create.response.on.question.dto';
import { PrismaQuestionRepository } from 'src/repositories/prisma-question.repository';

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

    const existingForm =
      await this.formRepository.getsurveyFeedbackById(formId);
    if (!existingForm) {
      throw new BadRequestException('Survey not found for this business');
    }

    const userSurveyResponse = await this.userResponseRepository.create(
      existingForm.id,
      guestData,
      userId || null,
    );

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
            ),
          ),
        );
      } else {
        return this.responseQuestionRepository.create(
          questionId,
          null,
          userSurveyResponse.id,
          answerText,
          ratingValue,
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

  // async validateResponses(
  //   responses: Response[],
  //   settings: QuestionSetting[],
  // ): string[] {
  //   const errors: string[] = [];

  //   responses.forEach((response) => {
  //     const questionSetting = settings.find(
  //       (setting) => setting.key === response.questionId,
  //     );

  //     if (!questionSetting) {
  //       errors.push(`No settings found for question ID ${response.questionId}`);
  //       return;
  //     }

  //     const { settings: questionSettings } = questionSetting;

  //     // Kiểm tra nếu câu hỏi là bắt buộc
  //     if (
  //       questionSettings.require &&
  //       !response.answerText &&
  //       !response.answerOptionId &&
  //       response.ratingValue === undefined
  //     ) {
  //       errors.push(
  //         `Question ID ${response.questionId} is required but not answered.`,
  //       );
  //       return;
  //     }

  //     // Kiểm tra loại câu hỏi
  //     switch (
  //       questionSettings.type // Thay `questionSetting.key` thành `questionSettings.type`
  //     ) {
  //       case 'SINGLE_CHOICE':
  //       case 'PICTURE_SELECTION':
  //         if (questionSettings.require && !response.answerOptionId) {
  //           errors.push(
  //             `Question ID ${response.questionId} requires an answer.`,
  //           );
  //         }
  //         break;

  //       case 'MULTI_CHOICE':
  //         if (response.answerOptionId) {
  //           if (
  //             response.answerOptionId.length <
  //             (questionSettings.minSelections || 1)
  //           ) {
  //             errors.push(
  //               `Question ID ${response.questionId} requires at least ${questionSettings.minSelections} selections.`,
  //             );
  //           }
  //           if (
  //             response.answerOptionId.length >
  //             (questionSettings.maxSelections || Infinity)
  //           ) {
  //             errors.push(
  //               `Question ID ${response.questionId} allows a maximum of ${questionSettings.maxSelections} selections.`,
  //             );
  //           }
  //         } else if (questionSettings.require) {
  //           errors.push(
  //             `Question ID ${response.questionId} requires at least one selection.`,
  //           );
  //         }
  //         break;

  //       case 'INPUT_TEXT':
  //         if (questionSettings.require && !response.answerText) {
  //           errors.push(
  //             `Question ID ${response.questionId} requires an input text.`,
  //           );
  //         }
  //         break;

  //       case 'RATING_SCALE':
  //         if (
  //           questionSettings.isRequired &&
  //           response.ratingValue === undefined
  //         ) {
  //           errors.push(
  //             `Question ID ${response.questionId} requires a rating value.`,
  //           );
  //         }
  //         if (
  //           response.ratingValue &&
  //           !questionSettings.availableRanges.includes(
  //             response.ratingValue.toString(),
  //           )
  //         ) {
  //           errors.push(
  //             `Question ID ${response.questionId} rating value must be one of the available ranges: ${questionSettings.availableRanges.join(', ')}.`,
  //           );
  //         }
  //         break;

  //       default:
  //         errors.push(
  //           `Unknown question type for question ID ${response.questionId}.`,
  //         );
  //     }
  //   });

  //   return errors;
  // }
}
