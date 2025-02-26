import { Injectable } from '@nestjs/common';
import { IFormSettingRepository } from './i-repositories/setting.repository';
import { UpdateSettingTypeDto } from 'src/admin/dtos/update.setting.type.dtos';
import { PrismaService } from 'src/config/prisma.service';
import { SettingTypes } from 'src/models/SettingTypes';
import { SurveyFeedbackSettings } from '@prisma/client';
import { BusinessSurveyFeedbackSettings } from 'src/models/BusinessSurveyFeedbackSettings';

@Injectable()
export class PrismaFormSettingRepository implements IFormSettingRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findAllSettingTyped(tx?: any): Promise<SettingTypes[]> {
    const prisma = tx || this.prisma;
    return prisma.settingTypes.findMany();
  }

  async findById(id: number, tx?: any): Promise<SettingTypes | null> {
    const prisma = tx || this.prisma;
    return prisma.settingTypes.findUnique({
      where: { id },
    });
  }

  async update(
    id: number,
    data: UpdateSettingTypeDto,
    tx?: any,
  ): Promise<SettingTypes> {
    const prisma = tx || this.prisma;
    return prisma.settingTypes.update({
      where: { id },
      data,
    });
  }

  async delete(id: number, tx?: any): Promise<void> {
    const prisma = tx || this.prisma;
    await prisma.settingTypes.delete({
      where: { id },
    });
  }

  async updateFormSetting(
    key: string,
    value: any,
    formSettingTypesId: number,
    tx?: any,
  ): Promise<SurveyFeedbackSettings> {
    const prisma = tx || this.prisma;
    return prisma.surveyFeedbackSettings.update({
      where: { key },
      data: {
        value,
        formSettingTypesId,
      },
    });
  }

  async createFormSetting(
    key: string,
    value: any,
    formSettingTypesId: number,
    label: string,
    description: string,
    tx?: any,
  ): Promise<SurveyFeedbackSettings> {
    const prisma = tx || this.prisma;
    return prisma.surveyFeedbackSettings.create({
      data: {
        key,
        value,
        formSettingTypesId,
        label,
        description,
      },
    });
  }

  async getFormSettingByKey(
    key: string,
    tx?: any,
  ): Promise<SurveyFeedbackSettings | null> {
    const prisma = tx || this.prisma;
    return prisma.surveyFeedbackSettings.findUnique({
      where: { key },
    });
  }

  async upsertSettingType(
    name: string,
    description: string,
    tx?: any,
  ): Promise<SettingTypes> {
    const prisma = tx || this.prisma;
    return prisma.settingTypes.upsert({
      where: { name },
      update: { description },
      create: { name, description },
    });
  }

  async upsertFormSetting(
    key: string,
    value: any,
    label: string,
    description: string,
    formSettingTypesId: number,
    tx?: any,
  ): Promise<SurveyFeedbackSettings> {
    const prisma = tx || this.prisma;
    return prisma.surveyFeedbackSettings.upsert({
      where: { key },
      update: { value, formSettingTypesId },
      create: { key, value, formSettingTypesId, label, description },
    });
  }

  async getAllFormSetting(tx?: any): Promise<SurveyFeedbackSettings[]> {
    const prisma = tx || this.prisma;
    return prisma.surveyFeedbackSettings.findMany();
  }

  async saveSetting(
    formId: number,
    businessId: number,
    key: string,
    value: any,
    formSettingId: number,
    tx?: any,
  ): Promise<BusinessSurveyFeedbackSettings> {
    const prisma = tx || this.prisma;
    return prisma.businessSurveyFeedbackSettings.create({
      data: {
        businessId,
        formId,
        key,
        value,
        formSettingId,
      },
    });
  }

  async upsertSetting(
    formId: number,
    businessId: number | null,
    formSettingId: number,
    key: string,
    value: any,
    tx?: any,
  ): Promise<BusinessSurveyFeedbackSettings> {
    const prisma = tx || this.prisma;
    return prisma.businessSurveyFeedbackSettings.upsert({
      where: {
        businessId_formId_key: { businessId, formId, key },
      },
      update: { value },
      create: { businessId, formId, key, value, formSettingId },
    });
  }

  async getDefaultSetting(
    businessId: number,
    formId: number,
    tx?: any,
  ): Promise<BusinessSurveyFeedbackSettings[]> {
    const prisma = tx || this.prisma;
    return prisma.businessSurveyFeedbackSettings.findMany({
      where: { businessId, formId },
    });
  }

  async getAllBusinessSettingTypes(
    businessId: number,
    formId: number,
    tx?: any,
  ): Promise<any[]> {
    const prisma = tx || this.prisma;
    return prisma.settingTypes.findMany({
      include: {
        settings: {
          include: {
            businessSurveyFeedbackSettings: {
              where: { businessId, formId },
              select: { key: true, value: true },
            },
          },
        },
      },
    });
  }

  async getAllFormSettingBusiness(
    businessId: number,
    formId: number,
    tx?: any,
  ): Promise<BusinessSurveyFeedbackSettings[]> {
    const prisma = tx || this.prisma;
    return prisma.businessSurveyFeedbackSettings.findMany({
      where: { businessId, formId },
    });
  }
}
