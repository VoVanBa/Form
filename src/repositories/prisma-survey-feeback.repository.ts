import { Injectable } from '@nestjs/common';
import { CreatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/create.form.dto';
import { UpdatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/update.form.dto';
import { PrismaService } from 'src/config/prisma.service';
import { FormStatus } from 'src/models/enums/FormStatus';
import { SurveyFeedback } from 'src/models/SurveyFeedback';
import { ISurveyFeedbackRepository } from './i-repositories/survey-feedback.repository';
@Injectable()
export class PrismaSurveyFeedbackRepository
  implements ISurveyFeedbackRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async createSurveyFeedback(
    data: CreatesurveyFeedbackDto,
    businessId: number,
    tx?: any,
  ): Promise<SurveyFeedback> {
    const client = tx || this.prisma;
    const surveyFeedback = await client.surveyFeedback.create({
      data: {
        ...data,
        businessId,
      },
    });
    return SurveyFeedback.fromPrisma(surveyFeedback);
  }

  async getSurveyFeedbackById(id: number, tx?: any): Promise<SurveyFeedback> {
    const client = tx || this.prisma;
    const surveyFeedback = await client.surveyFeedback.findFirst({
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
        SurveyFeedbackEnding: { include: { media: true } },
      },
    });

    if (!surveyFeedback)
      throw new Error(`SurveyFeedback with id ${id} not found`);
    return SurveyFeedback.fromPrisma(surveyFeedback);
  }

  async getAllSurveyFeedbacks(
    businessId: number,
    tx?: any,
  ): Promise<SurveyFeedback[]> {
    const client = tx || this.prisma;
    const prismaData = await client.surveyFeedback.findMany({
      where: { businessId },
    });
    return prismaData.map((data) => SurveyFeedback.fromPrisma(data));
  }

  async updateSurveyFeedback(
    id: number,
    data: UpdatesurveyFeedbackDto,
    tx?: any,
  ): Promise<SurveyFeedback> {
    const client = tx || this.prisma;
    const surveyFeedback = await client.surveyFeedback.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        allowAnonymous: data.allowAnonymous,
      },
    });
    return SurveyFeedback.fromPrisma(surveyFeedback);
  }

  async deleteSurveyFeedback(id: number, tx?: any): Promise<void> {
    const client = tx || this.prisma;
    await client.surveyFeedback.delete({ where: { id } });
  }

  async updateStatus(
    status: FormStatus,
    formId: number,
    tx?: any,
  ): Promise<SurveyFeedback> {
    const client = tx || this.prisma;
    const surveyFeedback = await client.surveyFeedback.update({
      where: { id: formId },
      data: { status },
    });
    return SurveyFeedback.fromPrisma(surveyFeedback);
  }

  async updateSurveyAllowAnonymous(
    formId: number,
    active: boolean,
    tx?: any,
  ): Promise<SurveyFeedback> {
    const client = tx || this.prisma;
    const surveyFeedback = await client.surveyFeedback.update({
      where: { id: formId },
      data: { allowAnonymous: active },
    });
    return SurveyFeedback.fromPrisma(surveyFeedback);
  }
}
