import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismasurveyFeedbackRepository } from 'src/repositories/prisma-form.repository';
import { PrismaUserResponseRepository } from 'src/repositories/prisma-user-response.repository';
import { PrismaResponseQuestionRepository } from 'src/repositories/Prisma-response-question.repository';
import { CreateResponseOnQuestionDto } from './dtos/create.response.on.question.dto';

@Injectable()
export class ResponseSurveyService {
  constructor(
    private formRepository: PrismasurveyFeedbackRepository,
    private userResponseRepository: PrismaUserResponseRepository,
    private responseQuestionRepository: PrismaResponseQuestionRepository,
  ) {}
  async saveGuestInfoAndResponsesAllowAnonymous(
    businessId: number,
    formId: number,
    createResponse: CreateResponseOnQuestionDto,
  ) {
    const { guestInfo, responses } = createResponse;
    const guestInfoJson = JSON.stringify(guestInfo);
    const existingForm =
      await this.formRepository.getsurveyFeedbackById(formId);
    if (!existingForm) {
      throw new BadRequestException('Survey not found for this business');
    }

    const allowAnonymous = existingForm.allowAnonymous;
    if (!allowAnonymous && (!guestInfo.name || !guestInfo.email)) {
      throw new BadRequestException('Guest name and email are required');
    }
    const userSurveyResponse = await this.userResponseRepository.create(
      existingForm.id,
      guestInfoJson,
    );
    for (const response of responses) {
      const { answerOptionId } = response;
      if (Array.isArray(answerOptionId)) {
        for (const optionId of answerOptionId) {
          const surveyResponseQuestion =
            await this.responseQuestionRepository.create(
              createResponse,
              userSurveyResponse.id,
            );
        }
      } else {
        await this.responseQuestionRepository.create(
          createResponse,
          userSurveyResponse.id,
        );
      }
    }
  }
}
