import { QuestionMedia } from '../response-customization/surveyfeedback.response';
import { Injectable } from '@nestjs/common';
import { CreatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/create.form.dto';
import { IsurveyFeedbackRepository } from './i-repositories/survey-feedback.repository';
import { UpdatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/update.form.dto';
import { PrismaService } from 'src/config/prisma.service';
import { FormStatus } from 'src/models/enums/FormStatus';
import { SurveyFeedback } from 'src/models/SurveyFeedback';
import { SurveyFeedbackType } from 'src/models/enums/SurveyFeedbackType';

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
  async getsurveyFeedbackById(id: number): Promise<any> {
    const surveyFeedback = this.prisma.surveyFeedback.findUnique({
      where: { id },
      include: {
        questions: {
          where: { deletedAt: null },
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
        business: true,
        businessSettings: {
          include: {
            formSetting: true,
            business: true,
            form: true,
          },
        },
        userFormResponses: {
          include: {
            responseOnQuestions: true,
            user: true,
          },
        },
        configurations: {
          include: {
            question: true,
          },
        },
        responses: {
          include: {
            question: true,
            answerOption: true,
            userResponse: true,
          },
        },
      },
    });

    return surveyFeedback;
  }

  async getAllsurveyFeedbacks(businessId: number): Promise<SurveyFeedback[]> {
    const prismaData = await this.prisma.surveyFeedback.findMany({
      where: {
        businessId,
      },
    });
    return prismaData.map(this.mapSurveyFeedback);
  }

  private mapSurveyFeedback(data: any): SurveyFeedback {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      type: data.type as SurveyFeedbackType,
      allowAnonymous: data.allowAnonymous,
      status: data.status as FormStatus,
      businessId: data.businessId,
      businessSettings: data.businessSettings,
      business: data.business,
      questions: data.questions,
      userFormResponses: data.userFormResponses,
      configurations: data.configurations,
      responses: data.responses,
    };
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
