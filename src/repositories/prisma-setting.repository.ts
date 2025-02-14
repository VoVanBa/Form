import { Injectable } from '@nestjs/common';
import { IFormSettingRepository } from './i-repositories/setting.repository';
import { UpdateSettingTypeDto } from 'src/admin/dtos/update.setting.type.dtos';
import { PrismaService } from 'src/config/prisma.service';

@Injectable()
export class PrismaFormSettingRepository implements IFormSettingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllSettingTyped(): Promise<any[]> {
    return this.prisma.settingTypes.findMany();
  }

  async findById(id: number): Promise<any | null> {
    return this.prisma.settingTypes.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: UpdateSettingTypeDto): Promise<any> {
    return this.prisma.settingTypes.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.settingTypes.delete({
      where: { id },
    });
  }

  async updateFormSetting(key: string, value: any, formSettingTypesId) {
    return this.prisma.surveyFeedbackSettings.update({
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
    formSettingTypesId,
    label: string,
    description: string,
  ) {
    return this.prisma.surveyFeedbackSettings.create({
      data: {
        key,
        value,
        formSettingTypesId,
        label,
        description,
      },
    });
  }
  async getFormsettingByKey(key: string) {
    return this.prisma.surveyFeedbackSettings.findUnique({
      where: { key },
    });
  }

  async upsertSettingType(name: string, description: string) {
    return this.prisma.settingTypes.upsert({
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
  ) {
    return this.prisma.surveyFeedbackSettings.upsert({
      where: { key },
      update: { value, formSettingTypesId },
      create: { key, value, formSettingTypesId, label, description },
    });
  }
  async getAllFormSetting() {
    return this.prisma.surveyFeedbackSettings.findMany();
  }
  async saveSetting(
    formId: number,
    businessId: number,
    key: string,
    value: any,
    formSettingId: number,
  ) {
    return this.prisma.businessSurveyFeedbackSettings.create({
      data: {
        businessId: businessId,
        key: key,
        value: value,
        formId: formId,
        formSettingId: formSettingId,
      },
    });
  }

  async upsertSetting(
    formId: number,
    businessId: number | null,
    formSettingId: number,
    key: string,
    value: any,
  ) {
    return this.prisma.businessSurveyFeedbackSettings.upsert({
      where: {
        businessId_formId_key: {
          businessId: businessId,
          formId: formId,
          key: key,
        },
      },
      update: {
        value: value,
      },
      create: {
        businessId: businessId,
        formId: formId,
        key: key,
        value: value,
        formSettingId: formSettingId,
      },
    });
  }
  async getDefaultSetting(businessId: number, formId: number) {
    return this.prisma.businessSurveyFeedbackSettings.findMany({
      where: {
        businessId,
        formId,
      },
    });
  }
  async getAllBusinessSettingTypes(businessId: number, formId: number) {
    const formSettingTypes = await this.prisma.settingTypes.findMany({
      include: {
        settings: {
          include: {
            businessSurveyFeedbackSettings: {
              where: {
                businessId: businessId,
                formId: formId,
              },
              select: {
                key: true,
                value: true,
              },
            },
          },
        },
      },
    });

    return formSettingTypes;
  }

  async getAllFormSettingBusiness(businessId: number, formId: number) {
    return this.prisma.businessSurveyFeedbackSettings.findMany({
      where: {
        businessId: businessId,
        formId: formId,
      },
    });
  }
}
