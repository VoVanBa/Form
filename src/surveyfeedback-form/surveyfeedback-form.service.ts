import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismasurveyFeedbackRepository } from 'src/repositories/prisma-survey-feeback.repository';
import { CreatesurveyFeedbackDto } from './dtos/create.form.dto';
import { UpdatesurveyFeedbackDto } from './dtos/update.form.dto';
import { PrismaBusinessRepository } from 'src/repositories/prims-business.repository';

import { FormStatus } from 'src/models/enums/FormStatus';
import { PrismaFormSettingRepository } from 'src/repositories/prisma-setting.repository';
import { plainToClass, plainToInstance } from 'class-transformer';
import { FormSettingTypeResponse } from 'src/response-customization/survey-feedback-setting-response';
import { I18nService } from 'nestjs-i18n';

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

    return this.i18n.translate('success.SURVEYFEEDBACKCREATED');
  }

  async getForms(businessId: number) {
    return this.formRepository.getAllsurveyFeedbacks(businessId);
  }

  async getFormByIdForBusiness(id: number) {
    // Kiểm tra xem surveyFeedback có được tìm thấy hay không
    const surveyFeedback = await this.formRepository.getsurveyFeedbackById(id);

    if (!surveyFeedback) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }

    console.log('head', surveyFeedback.questions, 'surveyFeedback'); // Thêm log để kiểm tra dữ liệu của surveyFeedback

    const surveyFeedbackDto = {
      id: surveyFeedback.id,
      name: surveyFeedback.name,
      description: surveyFeedback.description,
      createdBy: surveyFeedback.createdBy,
      createdAt: surveyFeedback.createdAt,
      updatedAt: surveyFeedback.updatedAt,
      type: surveyFeedback.type,
      allowAnonymous: surveyFeedback.allowAnonymous,
      status: surveyFeedback.status,
      businessId: surveyFeedback.businessId,
      questions: surveyFeedback.questions.map((question) => ({
        id: question.id,
        text: question.headline,
        type: question.questionType,
        index: question.index,
        media: question.questionOnMedia?.media
          ? {
              id: question.questionOnMedia.media.id,
              url: question.questionOnMedia.media.url,
            }
          : null,
        // .map((media) => ({
        //   id: media.id,
        //   url: media.media.url,
        // })),
        // media: question.questionOnMedia.url,
        answerOptions: question.answerOptions.map((answerOption) => ({
          id: answerOption.id,
          label: answerOption.label,
          index: answerOption.index,
          media: answerOption.answerOptionOnMedia?.media
            ? {
                id: answerOption.answerOptionOnMedia.media.id,
                url: answerOption.answerOptionOnMedia.media.url,
              }
            : null, // Chỉ lấy 1 media cho mỗi AnswerOption
        })),

        setting: question.businessQuestionConfiguration.settings,
      })),
    };

    return surveyFeedbackDto;
  }

  async getFormByIdForClient(id: number) {
    // Kiểm tra xem surveyFeedback có được tìm thấy hay không
    const surveyFeedback = await this.formRepository.getsurveyFeedbackById(id);

    if (!surveyFeedback) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }

    console.log('head', surveyFeedback.questions, 'surveyFeedback'); // Thêm log để kiểm tra dữ liệu của surveyFeedback

    const surveyFeedbackDto = {
      id: surveyFeedback.id,
      name: surveyFeedback.name,
      description: surveyFeedback.description,
      createdBy: surveyFeedback.createdBy,
      type: surveyFeedback.type,
      businessId: surveyFeedback.businessId,
      questions: surveyFeedback.questions.map((question) => ({
        id: question.id,
        text: question.headline,
        type: question.questionType,
        index: question.index,
        media: question.questionOnMedia?.media
          ? {
              id: question.questionOnMedia.media.id,
              url: question.questionOnMedia.media.url,
            }
          : null,

        answerOptions: question.answerOptions.map((answerOption) => ({
          id: answerOption.id,
          label: answerOption.label,
          index: answerOption.index,
          media: answerOption.answerOptionOnMedia?.media
            ? {
                id: answerOption.answerOptionOnMedia.media.id,
                url: answerOption.answerOptionOnMedia.media.url,
              }
            : null,
        })),

        setting: question.businessQuestionConfiguration.settings,
      })),
    };

    return surveyFeedbackDto;
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

    const existingForm = await this.getFormByIdForBusiness(formId);
    if (!existingForm) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }
    return await this.formRepository.updateStatus(status as FormStatus, formId);
    // return await this.formRepository.updateStatus(status, formId);
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
          formSetting.id,
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
