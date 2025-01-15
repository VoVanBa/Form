import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismasurveyFeedbackRepository } from 'src/repositories/prisma-form.repository';
import { CreatesurveyFeedbackDto } from './dtos/create.form.dto';
import { UpdatesurveyFeedbackDto } from './dtos/update.form.dto';
import { PrismaBusinessRepository } from 'src/repositories/prims-business.repository';
import { FormStatus } from '@prisma/client';
import { PrismaFormSettingRepository } from 'src/repositories/prisma-setting.repository';
import { plainToInstance } from 'class-transformer';
import { SurveyFeedbackResponse } from 'src/responses/surveyfeedback.response';
import { FormSettingTypeResponse } from 'src/responses/survey-feedback-setting-response';

@Injectable()
export class SurveyFeedackFormService {
  constructor(
    private formRepository: PrismasurveyFeedbackRepository,
    private businessRepository: PrismaBusinessRepository,
    private formSetting: PrismaFormSettingRepository,
  ) {}
  async createForm(createFormDto: CreatesurveyFeedbackDto, businessId: number) {
    const save = await this.formRepository.createsurveyFeedback(
      createFormDto,
      businessId,
    );

    const formSetting = await this.formSetting.getAllFormSetting();

    const saveSettingsPromises = formSetting.map((form) =>
      this.formSetting.saveSetting(
        save.id,
        businessId,
        form.key,
        form.value,
        form.id,
      ),
    );

    await Promise.all(saveSettingsPromises);

    return save;
  }

  async getForms(businessId: number) {
    return this.formRepository.getAllsurveyFeedbacks(businessId);
  }
  async getFormById(
    id: number,
    businessId: number,
  ): Promise<SurveyFeedbackResponse> {
    const business = this.businessRepository.getbusinessbyId(businessId);
    if (!business) {
      throw new BadRequestException('not found business');
    }
    const surveyFeedback = this.formRepository.getsurveyFeedbackById(id);

    return plainToInstance(SurveyFeedbackResponse, surveyFeedback, {
      excludeExtraneousValues: true,
    });
  }
  async updateForm(id: number, updateFormDto: UpdatesurveyFeedbackDto) {
    return this.formRepository.updatesurveyFeedback(id, updateFormDto);
  }
  async deleteForm(id: number) {
    return this.formRepository.deletesurveyFeedback(id);
  }
  async updateStatus(status: FormStatus, formId: number, businessId: number) {
    const existingBusiness =
      this.businessRepository.getbusinessbyId(businessId);

    if (!existingBusiness) {
      throw new BadRequestException('bussiness not found');
    }

    const existingForm = this.getFormById(formId, businessId);
    if (!existingForm) {
      throw new BadRequestException('form not found');
    }

    this.formRepository.updateStatus(status, formId);
  }

  async updateSurveyallowAnonymous(surveyId: number, active: boolean) {
    const survey = await this.formRepository.getsurveyFeedbackById(surveyId);
    if (!survey) {
      throw new BadRequestException('survey id not existing');
    }
    return await this.formRepository.updateSurveyallowAnonymous(
      surveyId,
      active,
    );
  }

  async updateFormSettings(
    formId: number,
    businessId: number | null,
    settings: { key: string; value: any }[],
  ) {
    const allFormSettings = await this.formSetting.getAllFormSetting();
    const currentSettings = await this.formSetting.getDefaultSetting(
      businessId,
      formId,
    );

    const promises = settings.map((newSetting) => {
      const existingSetting = currentSettings.find(
        (current) => current.key === newSetting.key,
      );

      if (
        existingSetting &&
        JSON.stringify(existingSetting.value) ===
          JSON.stringify(newSetting.value)
      ) {
        return null;
      } else {
        // Tìm formSetting dựa trên key
        const formSetting = allFormSettings.find(
          (setting) => setting.key === newSetting.key,
        );
        if (!formSetting) {
          throw new Error(`FormSetting not found for key: ${newSetting.key}`);
        }
        return this.formSetting.upsertSetting(
          formId,
          businessId,
          formSetting.id, // Sử dụng id từ formSetting
          newSetting.key,
          newSetting.value,
        );
      }
    });

    const filteredPromises = promises.filter((promise) => promise !== null);

    await Promise.all(filteredPromises);
  }

  // async getSettingTypeWithBusinessSettings(businessId: number, formId: number) {
  //   return this.formSetting.getSettingTypeWithBusinessSettings(
  //     businessId,
  //     formId,
  //   );
  // }

  async getSettingTypeWithBusinessSettings(
    businessId: number,
    formId: number,
  ): Promise<FormSettingTypeResponse[]> {
    const businessSettings =
      await this.formSetting.getSettingTypeWithBusinessSettings(
        businessId,
        formId,
      );

    if (!Array.isArray(businessSettings) || businessSettings.length === 0) {
      throw new Error('No settings found');
    }
    const formattedData = businessSettings.map((type) => ({
      name: type.name,
      description: type.description,
      settings: type.settings.map((setting) => ({
        label: setting.label,
        description: setting.description,
        businessSettings: setting.BusinessSurveyFeedbackSettings.map(
          (businessSetting) => ({
            key: businessSetting.key,
            value: businessSetting.value,
          }),
        ),
      })),
    }));

    return plainToInstance(FormSettingTypeResponse, formattedData, {
      excludeExtraneousValues: true,
    });
  }
}
