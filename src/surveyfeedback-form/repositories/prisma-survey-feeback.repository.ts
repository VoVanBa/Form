import { Injectable } from '@nestjs/common';
import { CreatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/create.form.dto';
import { UpdatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/update.form.dto';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { FormStatus } from 'src/surveyfeedback-form/entities/enums/FormStatus';
import { SurveyFeedback } from 'src/surveyfeedback-form/entities/SurveyFeedback';
import { ISurveyFeedbackRepository } from './interface/survey-feedback.repository';

@Injectable()
export class PrismaSurveyFeedbackRepository
  implements ISurveyFeedbackRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async createSurveyFeedback(
    data: CreatesurveyFeedbackDto,
    businessId: number,
  ): Promise<SurveyFeedback> {
    const surveyFeedback = await this.prisma.surveyFeedback.create({
      data: {
        ...data,
        businessId,
        
      },
    });
    return new SurveyFeedback(surveyFeedback);
  }

  async getSurveyFeedbackById(id: number): Promise<SurveyFeedback> {
    const surveyFeedback = await this.prisma.surveyFeedback.findFirst({
      where: { id },
      include: {
        questions: {
          where: { deletedAt: null },
          orderBy: { index: 'asc' },
          include: {
            questionOnMedia: { include: { media: true } },
            answerOptions: {
              orderBy: { index: 'asc' },
              include: { answerOptionOnMedia: { include: { media: true } } },
            },
            businessQuestionConfiguration: true,
            questionConditions: {
              include: {
                questionLogic: true,
              },
            },
          },
        },
        business: true,
        businessSettings: {
          include: {
            formSetting: {
              include: {
                businessSurveyFeedbackSettings: true,
                formSettingTypes: true,
              },
            },
            business: true,
            form: true,
          },
        },
        surveyFeedbackEnding: { include: { media: true } },
      },
    });

    if (!surveyFeedback) {
      throw new Error(`SurveyFeedback with id ${id} not found`);
    }
    return new SurveyFeedback(surveyFeedback);
  }

  async getAllSurveyFeedbacks(businessId: number): Promise<SurveyFeedback[]> {
    const prismaData = await this.prisma.surveyFeedback.findMany({
      where: { businessId },
    });
    return prismaData.map((data) => new SurveyFeedback(data));
  }

  async updateSurveyFeedback(
    id: number,
    data: UpdatesurveyFeedbackDto,
  ): Promise<SurveyFeedback> {
    const surveyFeedback = await this.prisma.surveyFeedback.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        allowAnonymous: data.allowAnonymous,
        surveyFeedbackEnding: data.ending
          ? {
              update: {
                mediaId: data.ending.endingMediaId,
                redirectUrl: data.ending.endingRedirectUrl,
                message: data.ending.endingMessage,
              },
            }
          : undefined,
      },
    });
    return new SurveyFeedback(surveyFeedback);
  }

  async deleteSurveyFeedback(id: number): Promise<void> {
    await this.prisma.surveyFeedback.delete({ where: { id } });
  }

  async updateStatus(
    status: FormStatus,
    formId: number,
  ): Promise<SurveyFeedback> {
    const surveyFeedback = await this.prisma.surveyFeedback.update({
      where: { id: formId },
      data: { status },
    });
    return new SurveyFeedback(surveyFeedback);
  }

  async updateSurveyAllowAnonymous(
    formId: number,
    active: boolean,
  ): Promise<SurveyFeedback> {
    const surveyFeedback = await this.prisma.surveyFeedback.update({
      where: { id: formId },
      data: { allowAnonymous: active },
    });
    return new SurveyFeedback(surveyFeedback);
  }
}
