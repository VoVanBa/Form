import { Injectable } from '@nestjs/common';
import { CreatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/create.form.dto';
import { UpdatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/update.form.dto';
import { PrismaService } from 'src/config/providers/prisma.service';
import { FormStatus } from 'src/models/enums/FormStatus';
import { SurveyFeedback } from 'src/models/SurveyFeedback';
import { ISurveyFeedbackRepository } from './i-repositories/survey-feedback.repository';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaSurveyFeedbackRepository
  implements ISurveyFeedbackRepository
{
  constructor(private readonly prisma: PrismaService) {}

  // Định nghĩa kiểu rõ ràng cho tx
  private getClient(
    tx?: Prisma.TransactionClient,
  ): PrismaService | Prisma.TransactionClient {
    return tx || this.prisma;
  }

  async createSurveyFeedback(
    data: CreatesurveyFeedbackDto,
    businessId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<SurveyFeedback> {
    const client = this.getClient(tx);
    const surveyFeedback = await client.surveyFeedback.create({
      data: {
        ...data,
        businessId,
      },
    });
    return SurveyFeedback.fromPrisma(surveyFeedback);
  }

  async getSurveyFeedbackById(
    id: number,
    tx?: Prisma.TransactionClient,
  ): Promise<SurveyFeedback> {
    const client = this.getClient(tx);
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

    if (!surveyFeedback) {
      throw new Error(`SurveyFeedback with id ${id} not found`);
    }
    return SurveyFeedback.fromPrisma(surveyFeedback);
  }

  async getAllSurveyFeedbacks(
    businessId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<SurveyFeedback[]> {
    const client = this.getClient(tx);
    const prismaData = await client.surveyFeedback.findMany({
      where: { businessId },
    });
    return prismaData.map((data) => SurveyFeedback.fromPrisma(data));
  }

  async updateSurveyFeedback(
    id: number,
    data: UpdatesurveyFeedbackDto,
    tx?: Prisma.TransactionClient,
  ): Promise<SurveyFeedback> {
    const client = this.getClient(tx);
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

  async deleteSurveyFeedback(
    id: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = this.getClient(tx);
    await client.surveyFeedback.delete({ where: { id } });
  }

  async updateStatus(
    status: FormStatus,
    formId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<SurveyFeedback> {
    const client = this.getClient(tx);
    const surveyFeedback = await client.surveyFeedback.update({
      where: { id: formId },
      data: { status },
    });
    return SurveyFeedback.fromPrisma(surveyFeedback);
  }

  async updateSurveyAllowAnonymous(
    formId: number,
    active: boolean,
    tx?: Prisma.TransactionClient,
  ): Promise<SurveyFeedback> {
    const client = this.getClient(tx);
    const surveyFeedback = await client.surveyFeedback.update({
      where: { id: formId },
      data: { allowAnonymous: active },
    });
    return SurveyFeedback.fromPrisma(surveyFeedback);
  }
}
