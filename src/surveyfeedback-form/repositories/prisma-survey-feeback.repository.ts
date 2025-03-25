import { Injectable } from '@nestjs/common';
import { CreatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/create.form.dto';
import { UpdatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/update.form.dto';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { FormStatus } from 'src/surveyfeedback-form/entities/enums/FormStatus';
import { SurveyFeedback } from 'src/surveyfeedback-form/entities/SurveyFeedback';
import { ISurveyFeedbackRepository } from './interface/survey-feedback.repository';
import { SurveySettingKey } from 'src/settings/entities/enums/SurveySettingKey';

@Injectable()
export class PrismaSurveyFeedbackRepository
  implements ISurveyFeedbackRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async createSurveyFeedback(
    data: CreatesurveyFeedbackDto,
    businessId: number,
    defaultSetting?: any,
  ): Promise<SurveyFeedback> {
    const surveyFeedback = await this.prisma.surveyFeedback.create({
      data: {
        ...data,
        businessId,
        businessSettings: defaultSetting?.length
          ? {
              createMany: {
                data: defaultSetting.map((setting) => ({
                  key: setting.key,
                  value: setting.value,
                })),
              },
            }
          : undefined,
      },
      include: {
        businessSettings: true, // Lấy cả settings khi tạo xong
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
            questionConfiguration: true,
            sourceLogics: true,
            targetLogics: true,

          },
        },
        business: true,
        businessSettings: true,
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
        businessSettings: data.settings
          ? {
              updateMany: data.settings.map((setting) => ({
                where: { key: setting.key, formId: id },
                data: { value: setting.value },
              })),
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
