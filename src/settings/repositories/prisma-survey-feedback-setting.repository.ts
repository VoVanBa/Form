import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { SurveyFeedbackSettings } from '../entities/SurveyFeedbackSettings';
import {
  SurveyFeedbackSettingsDto,
  UpdateSettingDto,
} from '../dtos/survey-feedback-settings.dto';

@Injectable()
export class PrismaSurveyFeedbackSettingRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    data: SurveyFeedbackSettingsDto,
  ): Promise<SurveyFeedbackSettings> {
    const setting = await this.prisma.surveyFeedbackSettings.create({
      data,
    });
    return new SurveyFeedbackSettings(setting);
  }

  async findAll(formId: number): Promise<SurveyFeedbackSettings[]> {
    const settings = await this.prisma.surveyFeedbackSettings.findMany({
      where: {
        formId,
      },
    });
    return settings.map((setting) => new SurveyFeedbackSettings(setting));
  }

  async findOne(id: number): Promise<SurveyFeedbackSettings | null> {
    const setting = await this.prisma.surveyFeedbackSettings.findUnique({
      where: { id },
    });
    return new SurveyFeedbackSettings(setting);
  }

  async update(
    id: number,
    data: UpdateSettingDto,
  ): Promise<SurveyFeedbackSettings> {
    const setting = await this.prisma.surveyFeedbackSettings.update({
      where: { id },
      data,
    });
    return new SurveyFeedbackSettings(setting);
  }

  async remove(id: number): Promise<SurveyFeedbackSettings> {
    const setting = await this.prisma.surveyFeedbackSettings.delete({
      where: { id },
    });
    return new SurveyFeedbackSettings(setting);
  }
}
