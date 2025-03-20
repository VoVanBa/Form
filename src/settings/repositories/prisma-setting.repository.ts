import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { IFormSettingRepository } from './interface/setting.repository';
import { UpdateSettingTypeDto } from 'src/admin/dtos/update.setting.type.dtos';
import { SurveyFeedbackSettings } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { SettingTypes } from '../entities/SettingTypes';
import { BusinessSurveyFeedbackSettings } from '../entities/BusinessSurveyFeedbackSettings';

@Injectable()
export class PrismaFormSettingRepository implements IFormSettingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllSettingTyped(): Promise<SettingTypes[]> {
    const data = await this.prisma.settingTypes.findMany();
    return data.map((item) => new SettingTypes(item));
  }

  async findById(id: number): Promise<SettingTypes | null> {
    const data = await this.prisma.settingTypes.findUnique({ where: { id } });
    return data ? new SettingTypes(data) : null;
  }

  async update(id: number, data: UpdateSettingTypeDto): Promise<SettingTypes> {
    const response = await this.prisma.settingTypes.update({
      where: { id },
      data,
    });
    return new SettingTypes(response);
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.settingTypes.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new Error(`SettingType với ID ${id} không tồn tại.`);
      }
      throw error;
    }
  }

  async updateFormSetting(
    key: string,
    value: any,
    formSettingTypesId: number,
  ): Promise<SurveyFeedbackSettings> {
    return await this.prisma.surveyFeedbackSettings.update({
      where: { key },
      data: { value, formSettingTypesId },
    });
  }

  async createFormSetting(
    key: string,
    value: any,
    formSettingTypesId: number,
    label: string,
    description: string,
  ): Promise<SurveyFeedbackSettings> {
    return await this.prisma.surveyFeedbackSettings.create({
      data: { key, value, formSettingTypesId, label, description },
    });
  }

  async getFormSettingByKey(
    key: string,
  ): Promise<SurveyFeedbackSettings | null> {
    return await this.prisma.surveyFeedbackSettings.findUnique({
      where: { key },
    });
  }

  async upsertSettingType(
    name: string,
    description: string,
  ): Promise<SettingTypes> {
    const data = await this.prisma.settingTypes.upsert({
      where: { name },
      update: { description },
      create: { name, description },
    });
    return new SettingTypes(data);
  }

  async upsertFormSetting(
    key: string,
    value: any,
    label: string,
    description: string,
    formSettingTypesId: number,
  ): Promise<SurveyFeedbackSettings> {
    return await this.prisma.surveyFeedbackSettings.upsert({
      where: { key },
      update: { value, formSettingTypesId },
      create: { key, value, formSettingTypesId, label, description },
    });
  }

  async getAllFormSetting(): Promise<SurveyFeedbackSettings[]> {
    return await this.prisma.surveyFeedbackSettings.findMany();
  }

  async saveSetting(
    formId: number,
    businessId: number,
    key: string,
    value: any,
    formSettingId: number,
  ): Promise<BusinessSurveyFeedbackSettings> {
    const data = await this.prisma.businessSurveyFeedbackSettings.create({
      data: { businessId, formId, key, value, formSettingId },
    });
    return new BusinessSurveyFeedbackSettings(data);
  }

  async upsertSetting(
    formId: number,
    businessId: number | null,
    formSettingId: number,
    key: string,
    value: any,
  ): Promise<BusinessSurveyFeedbackSettings> {
    const whereCondition = businessId
      ? { businessId_formId_key: { businessId, formId, key } }
      : { formId_key: { formId, key } };

    const data = await this.prisma.businessSurveyFeedbackSettings.upsert({
      where: whereCondition as any,
      update: { value },
      create: { businessId, formId, key, value, formSettingId },
    });

    return new BusinessSurveyFeedbackSettings(data);
  }

  async getDefaultSetting(
    businessId: number,
    formId: number,
  ): Promise<BusinessSurveyFeedbackSettings[]> {
    const data = await this.prisma.businessSurveyFeedbackSettings.findMany({
      where: { businessId, formId },
    });
    return data.map((item) => new BusinessSurveyFeedbackSettings(item));
  }

  async getAllBusinessSettingTypes(
    businessId: number,
    formId: number,
  ): Promise<BusinessSurveyFeedbackSettings[]> {
    const data = await this.prisma.businessSurveyFeedbackSettings.findMany({
      where: { businessId, formId },
      include: {
        formSetting: { include: { formSettingTypes: true } },
      },
    });
    return data.map((item) => new BusinessSurveyFeedbackSettings(item));
  }

  async getAllFormSettingBusiness(
    businessId: number,
    formId: number,
  ): Promise<BusinessSurveyFeedbackSettings[]> {
    const data = await this.prisma.businessSurveyFeedbackSettings.findMany({
      where: { businessId, formId },
    });
    return data.map((item) => new BusinessSurveyFeedbackSettings(item));
  }
}
