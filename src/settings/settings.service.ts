import { Injectable } from '@nestjs/common';
import { PrismaFormSettingRepository } from './repositories/prisma-setting.repository';
import { UpdateSettingTypeDto } from 'src/admin/dtos/update.setting.type.dtos';
import { SurveyFeedbackSettings } from '@prisma/client';
import { SettingTypes } from './entities/SettingTypes';
import { BusinessSurveyFeedbackSettings } from './entities/BusinessSurveyFeedbackSettings';

@Injectable()
export class SettingsService {
  constructor(
    private readonly formSettingRepository: PrismaFormSettingRepository,
  ) {}

  async findAllSettingTyped(): Promise<SettingTypes[]> {
    return this.formSettingRepository.findAllSettingTyped();
  }

  async findById(id: number): Promise<SettingTypes | null> {
    return this.formSettingRepository.findById(id);
  }

  async update(id: number, data: UpdateSettingTypeDto): Promise<SettingTypes> {
    return this.formSettingRepository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    return this.formSettingRepository.delete(id);
  }

  async updateFormSetting(
    key: string,
    value: any,
    formSettingTypesId: number,
  ): Promise<SurveyFeedbackSettings> {
    return this.formSettingRepository.updateFormSetting(
      key,
      value,
      formSettingTypesId,
    );
  }

  async createFormSetting(
    key: string,
    value: any,
    formSettingTypesId: number,
    label: string,
    description: string,
  ): Promise<SurveyFeedbackSettings> {
    return this.formSettingRepository.createFormSetting(
      key,
      value,
      formSettingTypesId,
      label,
      description,
    );
  }

  async getFormSettingByKey(
    key: string,
  ): Promise<SurveyFeedbackSettings | null> {
    return this.formSettingRepository.getFormSettingByKey(key);
  }

  async upsertSettingType(
    name: string,
    description: string,
  ): Promise<SettingTypes> {
    return this.formSettingRepository.upsertSettingType(name, description);
  }

  async upsertFormSetting(
    key: string,
    value: any,
    label: string,
    description: string,
    formSettingTypesId: number,
  ): Promise<SurveyFeedbackSettings> {
    return this.formSettingRepository.upsertFormSetting(
      key,
      value,
      label,
      description,
      formSettingTypesId,
    );
  }

  async getAllFormSetting(): Promise<SurveyFeedbackSettings[]> {
    return this.formSettingRepository.getAllFormSetting();
  }

  async saveSetting(
    formId: number,
    businessId: number,
    key: string,
    value: any,
    formSettingId: number,
  ): Promise<BusinessSurveyFeedbackSettings> {
    return this.formSettingRepository.saveSetting(
      formId,
      businessId,
      key,
      value,
      formSettingId,
    );
  }

  async upsertSetting(
    formId: number,
    businessId: number | null,
    formSettingId: number,
    key: string,
    value: any,
  ): Promise<BusinessSurveyFeedbackSettings> {
    return this.formSettingRepository.upsertSetting(
      formId,
      businessId,
      formSettingId,
      key,
      value,
    );
  }

  async getDefaultSetting(
    businessId: number,
    formId: number,
  ): Promise<BusinessSurveyFeedbackSettings[]> {
    return this.formSettingRepository.getDefaultSetting(businessId, formId);
  }

  async getAllBusinessSettingTypes(
    businessId: number,
    formId: number,
  ): Promise<BusinessSurveyFeedbackSettings[]> {
    return this.formSettingRepository.getAllBusinessSettingTypes(
      businessId,
      formId,
    );
  }

  async getAllFormSettingBusiness(
    businessId: number,
    formId: number,
  ): Promise<BusinessSurveyFeedbackSettings[]> {
    return this.formSettingRepository.getAllFormSettingBusiness(
      businessId,
      formId,
    );
  }
}
