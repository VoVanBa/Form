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
  async saveGuestInfoAndResponsesAllowAnonymous(
    businessId: number,
    formId: number,
    createResponse: CreateResponseOnQuestionDto,
  ) {
    const { guestData, responses } = createResponse;

    const existingForm =
      await this.formRepository.getsurveyFeedbackById(formId);
    if (!existingForm) {
      throw new BadRequestException('Survey not found for this business');
    }

    const allowAnonymous = existingForm.allowAnonymous;
    if (!allowAnonymous && (!guestData?.name || !guestData?.email)) {
      throw new BadRequestException('Guest name and email are required');
    }

    // Save guest information
    const userSurveyResponse = await this.userResponseRepository.create(
      existingForm.id,
      guestData,
    );

    for (const response of responses) {
      const { questionId, answerOptionId, ratingValue, answerText } = response;

      const question =
        await this.questionRepository.getQuessionById(questionId);
      if (!question) {
        throw new BadRequestException(
          `Question with id ${questionId} not found`,
        );
      }

      // Handle both single and multiple answer options
      const answerOptions = Array.isArray(answerOptionId)
        ? answerOptionId
        : [answerOptionId];

      for (const optionId of answerOptions) {
        await this.responseQuestionRepository.create(
          {
            questionId, // This is part of ResponseDto, not CreateResponseOnQuestionDto
            answerOptionId: optionId,
            answerText,
            ratingValue,
          },
          userSurveyResponse.id,
        );
      }
    }
  }
}
