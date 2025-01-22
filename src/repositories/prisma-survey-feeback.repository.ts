import { QuestionMedia } from '../response-customization/surveyfeedback.response';
import { Injectable } from '@nestjs/common';
import { CreatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/create.form.dto';
import { IsurveyFeedbackRepository } from './i-repositories/survey-feedback.repository';
import { UpdatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/update.form.dto';
import { FormStatus, SurveyFeedback, Media } from '@prisma/client';
import { PrismaService } from 'src/config/prisma.service';

@Injectable()
export class PrismasurveyFeedbackRepository
  implements IsurveyFeedbackRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async createsurveyFeedback(
    data: CreatesurveyFeedbackDto,
    businessId: number,
  ) {
    return this.prisma.surveyFeedback.create({
      data: {
        ...data,
        businessId: businessId,
      },
    });
  }
  async getsurveyFeedbackById(id: number) {
    return this.prisma.surveyFeedback.findUnique({
      where: { id },
      include: {
        questions: {
          where: { isDeleted: false },
          orderBy: { index: 'asc' },
          include: {
            questionOnMedia: {
              include: {
                media: true,
              },
            },
            answerOptions: {
              orderBy: { index: 'asc' },
              include: {
                answerOptionOnMedia: {
                  include: {
                    media: true,
                  },
                },
              },
            },
            businessQuestionConfiguration: true,
          },
        },
      },
    });
  }
  async getAllsurveyFeedbacks(businessId: number) {
    return this.prisma.surveyFeedback.findMany({
      where: {
        businessId,
      },
    });
  }
  async updatesurveyFeedback(id: number, data: UpdatesurveyFeedbackDto) {
    return this.prisma.surveyFeedback.update({
      where: { id },
      data,
    });
  }
  async deletesurveyFeedback(id: number) {
    return this.prisma.surveyFeedback.delete({
      where: { id },
    });
  }
  async updateStatus(status: FormStatus, formId: number) {
    return this.prisma.surveyFeedback.update({
      where: {
        id: formId,
      },
      data: {
        status: status,
      },
    });
  }

  async updateSurveyallowAnonymous(formId: number, active: boolean) {
    return await this.prisma.surveyFeedback.update({
      where: {
        id: formId,
      },
      data: {
        allowAnonymous: active,
      },
    });
  }
}
