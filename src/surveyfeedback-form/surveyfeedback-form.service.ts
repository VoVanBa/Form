import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismasurveyFeedbackRepository } from 'src/repositories/prisma-survey-feeback.repository';
import { CreatesurveyFeedbackDto } from './dtos/create.form.dto';
import { UpdatesurveyFeedbackDto } from './dtos/update.form.dto';
import { PrismaBusinessRepository } from 'src/repositories/prims-business.repository';
import { FormStatus as PrismaFormStatus } from '@prisma/client';
import { FormStatus } from 'src/models/enums/FormStatus';
import { PrismaFormSettingRepository } from 'src/repositories/prisma-setting.repository';
import { plainToInstance } from 'class-transformer';
import { SurveyFeedbackResponse } from 'src/response-customization/surveyfeedback.response';
import { FormSettingTypeResponse } from 'src/response-customization/survey-feedback-setting-response';
import { I18nService } from 'nestjs-i18n';
import { SurveyFeedbackType } from 'src/models/enums/SurveyFeedbackType';
import { SurveyFeedback } from 'src/models/SurveyFeedback';

@Injectable()
export class SurveyFeedackFormService {
  constructor(
    private formRepository: PrismasurveyFeedbackRepository,
    private businessRepository: PrismaBusinessRepository,
    private formSetting: PrismaFormSettingRepository,
    private readonly i18n: I18nService,
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

  async getFormById(id: number): Promise<SurveyFeedback> {
    const surveyFeedback = await this.formRepository.getsurveyFeedbackById(id);
    if (!surveyFeedback) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }

    return new SurveyFeedback(
      surveyFeedback.id,
      surveyFeedback.name,
      surveyFeedback.description,
      surveyFeedback.createdBy,
      surveyFeedback.createdAt,
      surveyFeedback.updatedAt,
      surveyFeedback.type as SurveyFeedbackType,
      surveyFeedback.allowAnonymous,
      surveyFeedback.status as FormStatus,
      surveyFeedback.businessId,
      surveyFeedback.businessSettings.map((setting) => ({
        ...setting,
        value:
          typeof setting.value === 'string'
            ? JSON.parse(setting.value)
            : setting.value,
        formSetting: setting.formSetting || null,
        business: surveyFeedback.business || null,
        form: setting.form || null,
      })),
      {
        ...surveyFeedback.business,
        user: 1, // Placeholder if needed
        businessSurveySettings: [],
        forms: [],
      },
      surveyFeedback.questions.map((question) => ({
        ...question,
        questionOnMedia: question.questionOnMedia.map((qom) => ({
          ...qom,
          media: qom.media.url,
        })),
        answerOptions: question.answerOptions.map((option) => ({
          ...option,
          answerOptionOnMedia: option.answerOptionOnMedia.map((aom) => ({
            ...aom,
            media: aom.media.url,
          })),
        })),
      })),
      surveyFeedback.userFormResponses,
      surveyFeedback.configurations.map((config) => ({
        ...config,
        question: config.question || { id: config.questionId },
        form: {
          id: surveyFeedback.id,
          name: surveyFeedback.name,
        },
        value: config.settings || '', // Add default value or appropriate value
        label: typeof config.settings === 'string' ? config.settings : '', // Ensure label is a string
      })),
      surveyFeedback.responses,
    );
  }
  async updateForm(id: number, updateFormDto: UpdatesurveyFeedbackDto) {
    return this.formRepository.updatesurveyFeedback(id, updateFormDto);
  }

  async deleteForm(id: number) {
    return this.formRepository.deletesurveyFeedback(id);
  }

  async updateStatus(status: FormStatus, formId: number, businessId: number) {
    const existingBusiness =
      await this.businessRepository.getbusinessbyId(businessId);
    if (!existingBusiness) {
      throw new BadRequestException(
        this.i18n.translate('errors.BUSINESSNOTFOUND'),
      );
    }

    const existingForm = await this.getFormById(formId);
    if (!existingForm) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }

    return await this.formRepository.updateStatus(status, formId);
  }

  async updateSurveyallowAnonymous(surveyId: number, active: boolean) {
    const survey = await this.formRepository.getsurveyFeedbackById(surveyId);
    if (!survey) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYIDNOTEXISTING'),
      );
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

  async getAllBusinessSettings(
    businessId: number,
    formId: number,
  ): Promise<FormSettingTypeResponse[]> {
    const businessSettings = await this.formSetting.getAllBusinessSettingTypes(
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
