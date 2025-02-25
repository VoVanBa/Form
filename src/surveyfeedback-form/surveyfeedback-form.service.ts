import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatesurveyFeedbackDto } from './dtos/create.form.dto';
import { UpdatesurveyFeedbackDto } from './dtos/update.form.dto';

import { FormStatus } from 'src/models/enums/FormStatus';
import { PrismaFormSettingRepository } from 'src/repositories/prisma-setting.repository';
import { plainToClass, plainToInstance } from 'class-transformer';
import { FormSettingTypeResponse } from 'src/response-customization/survey-feedback-setting-response';
import { I18nService } from 'nestjs-i18n';
import { SurveyFeedback } from 'src/models/SurveyFeedback';
import { QuestionRepository } from 'src/repositories/i-repositories/question.repository';
import { AddQuestionDto } from 'src/question/dtos/add.question.dto';
import { PrismaQuestionRepository } from 'src/repositories/prisma-question.repository';
import { PrismaAnswerOptionRepository } from 'src/repositories/prisma-anwser-option.repository';
import { PrismaMediaRepository } from 'src/repositories/prisma-media.repository';
import { Question } from 'src/models/Question';
import { PrismaSurveyEndingRepository } from 'src/repositories/prisma-survey-feedback-ending-repository';
import { BusinessService } from 'src/business/business.service';
import { UpdateQuestionDto } from 'src/question/dtos/update.question.dto';
import { QuestionService } from 'src/question/question.service';
import { PrismaSurveyFeedbackRepository } from 'src/repositories/prisma-survey-feeback.repository';

@Injectable()
export class SurveyFeedackFormService {
  constructor(
    private formRepository: PrismaSurveyFeedbackRepository,
    private businessService: BusinessService,
    private formSetting: PrismaFormSettingRepository,
    private questionRepository: PrismaQuestionRepository,
    private answerOptionRepository: PrismaAnswerOptionRepository,
    private mediaRepository: PrismaMediaRepository,
    private settingRepository: PrismaFormSettingRepository,
    private surveyEndingRepository: PrismaSurveyEndingRepository,
    private questionSerivce: QuestionService,
    private readonly i18n: I18nService,
  ) {}
  async createForm(
    createFormDto: CreatesurveyFeedbackDto,
    businessId: number,
    request?: any,
  ) {
    const tx = request?.tx;
    const save = await this.formRepository.createSurveyFeedback(
      createFormDto,
      businessId,
      tx,
    );

    await this.surveyEndingRepository.createSurveyEnding(
      { formId: save.id, message: 'Cảm ơn quý khách đã trả lời khảo sát' },
      tx,
    );

    const formSetting = await this.formSetting.getAllFormSetting(tx);
    const saveSettingsPromises = formSetting.map((form) =>
      this.formSetting.saveSetting(
        save.id,
        businessId,
        form.key,
        form.value,
        form.id,
        tx,
      ),
    );

    await Promise.all(saveSettingsPromises);
    return this.i18n.translate('success.SURVEYFEEDBACKCREATED');
  }

  async getForms(businessId: number, request?: any) {
    const tx = request?.tx;
    const form = await this.formRepository.getAllSurveyFeedbacks(
      businessId,
      tx,
    );
    if (form.length === 0) {
      throw new NotFoundException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }
    return {
      data: form.map((form) => ({
        id: form.id,
        name: form.name,
        description: form.description,
        type: form.type,
        status: form.status,
        allowAnonymous: form.allowAnonymous,
        createdAt: form.createdAt,
      })),
    };
  }

  async getFormByIdForBusiness(id: number, request?: any) {
    const tx = request?.tx;
    const surveyFeedback = await this.formRepository.getSurveyFeedbackById(
      id,
      tx,
    );
    if (!surveyFeedback) {
      throw new NotFoundException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }

    const surveyEnding =
      await this.surveyEndingRepository.getSurveyEndingBySurveyId(id, tx);

    return {
      id: surveyFeedback.id,
      name: surveyFeedback.name,
      description: surveyFeedback.description,
      createdBy: surveyFeedback.createdBy,
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
        setting: question.businessQuestionConfiguration?.settings || {},
      })),
      ending: surveyEnding
        ? {
            message: surveyEnding.message,
            redirectUrl: surveyEnding.redirectUrl || null,
            media: surveyEnding.media
              ? { id: surveyEnding.media.id, url: surveyEnding.media.url }
              : null,
          }
        : null,
    };
  }

  async getFormByIdForClient(id: number, request?: any) {
    const tx = request?.tx;
    const surveyFeedback = await this.formRepository.getSurveyFeedbackById(
      id,
      tx,
    );
    if (!surveyFeedback) {
      throw new NotFoundException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }

    if (surveyFeedback.status !== FormStatus.PUBLISHED) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYNOTAVAILABLE'),
      );
    }

    const surveyEnding =
      await this.surveyEndingRepository.getSurveyEndingBySurveyId(id, tx);

    return {
      id: surveyFeedback.id,
      name: surveyFeedback.name,
      description: surveyFeedback.description,
      type: surveyFeedback.type,
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
        setting: question.businessQuestionConfiguration?.settings || {},
      })),
      ending: surveyEnding
        ? {
            message: surveyEnding.message,
            redirectUrl: surveyEnding.redirectUrl || null,
            media: surveyEnding.media
              ? { id: surveyEnding.media.id, url: surveyEnding.media.url }
              : null,
          }
        : null,
    };
  }

  async updateForm(
    id: number,
    updateFormDto: UpdatesurveyFeedbackDto,
    request?: any,
  ) {
    const tx = request?.tx;
    return this.formRepository.updateSurveyFeedback(id, updateFormDto, tx);
  }

  async deleteForm(id: number, request?: any) {
    const tx = request?.tx;
    await this.formRepository.deleteSurveyFeedback(id, tx);
    return { message: 'Survey deleted successfully' };
  }

  async updateStatus(
    status: FormStatus,
    formId: number,
    businessId: number,
    request?: any,
  ) {
    const tx = request?.tx;
    const existingBusiness = await this.businessService.getbusinessbyId(
      businessId,
      tx,
    );
    if (!existingBusiness) {
      throw new NotFoundException(
        this.i18n.translate('errors.BUSINESSNOTFOUND'),
      );
    }

    const existingForm = await this.getFormByIdForBusiness(formId, request);
    if (!existingForm) {
      throw new NotFoundException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }

    return this.formRepository.updateStatus(status, formId, tx);
  }

  async updateSurveyAllowAnonymous(
    surveyId: number,
    active: boolean,
    request?: any,
  ) {
    const tx = request?.tx;
    const survey = await this.formRepository.getSurveyFeedbackById(
      surveyId,
      tx,
    );
    if (!survey) {
      throw new NotFoundException(
        this.i18n.translate('errors.SURVEYIDNOTEXISTING'),
      );
    }
    return this.formRepository.updateSurveyAllowAnonymous(surveyId, active, tx);
  }

  async updateFormSettings(
    formId: number,
    businessId: number | null,
    settings: { key: string; value: any }[],
    request?: any,
  ) {
    const tx = request?.tx;
    const allFormSettings = await this.formSetting.getAllFormSetting(tx);
    const currentSettings = await this.formSetting.getDefaultSetting(
      businessId,
      formId,
      tx,
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
      }
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
        tx,
      );
    });

    const filteredPromises = promises.filter((promise) => promise !== null);
    await Promise.all(filteredPromises);
  }

  async getAllBusinessSettings(
    businessId: number,
    formId: number,
    request?: any,
  ): Promise<any> {
    const tx = request?.tx;
    const businessSettings = await this.formSetting.getAllBusinessSettingTypes(
      businessId,
      formId,
      tx,
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
        businessSettings: setting.businessSurveyFeedbackSettings.map(
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

  async duplicateSurvey(id: number, businessId: number, request?: any) {
    const tx = request?.tx;
    const formExisting = await this.formRepository.getSurveyFeedbackById(
      id,
      tx,
    );
    if (!formExisting) {
      throw new NotFoundException(
        this.i18n.translate('errors.SURVEYIDNOTEXISTING'),
      );
    }

    const newForm = await this.formRepository.createSurveyFeedback(
      {
        name: `${formExisting.name} (Copy)`,
        description: formExisting.description,
        createdBy: formExisting.createdBy,
        type: formExisting.type,
        allowAnonymous: formExisting.allowAnonymous,
        status: FormStatus.DRAFT,
      },
      formExisting.businessId,
      tx,
    );

    const existingEnding =
      await this.surveyEndingRepository.getSurveyEndingBySurveyId(id, tx);
    if (existingEnding) {
      await this.surveyEndingRepository.createSurveyEnding(
        {
          formId: newForm.id,
          message: existingEnding.message,
          redirectUrl: existingEnding.redirectUrl,
          mediaId: existingEnding.mediaId,
        },
        tx,
      );
    }

    await this.duplicateQuestions(
      formExisting.id,
      newForm.id,
      formExisting.businessId,
      tx,
    );
    await this.duplicateSurveySettings(
      formExisting.id,
      newForm.id,
      formExisting.businessId,
      tx,
    );

    return newForm;
  }

  private async duplicateQuestions(
    originalFormId: number,
    newFormId: number,
    businessId: number,
    tx?: any,
  ) {
    const questions = await this.questionRepository.findAllQuestion(
      originalFormId,
      tx,
    );
    for (const question of questions) {
      const addQuestionDto: AddQuestionDto = {
        headline: question.headline,
        questionType: question.questionType,
      };
      const newQuestion = await this.questionRepository.createQuestion(
        newFormId,
        addQuestionDto,
        question.index,
        tx,
      );

      if (question.questionOnMedia) {
        await this.duplicateQuestionMedia(question.id, newQuestion.id, tx);
      }

      if (question.answerOptions.length > 0) {
        await this.duplicateAnswerOptions(
          question.id,
          newQuestion.id,
          businessId,
          tx,
        );
      }

      if (question.businessQuestionConfiguration) {
        await this.questionRepository.createQuestionSettings(
          newQuestion.id,
          question.businessQuestionConfiguration.settings,
          question.businessQuestionConfiguration.key,
          newFormId,
          tx,
        );
      }
    }
  }

  private async duplicateAnswerOptions(
    originalQuestionId: number,
    newQuestionId: number,
    businessId: number,
    tx?: any,
  ) {
    const answerOptions =
      await this.answerOptionRepository.getAllAnserOptionbyQuestionId(
        originalQuestionId,
        tx,
      );
    return Promise.all(
      answerOptions.map(async (option) => {
        const newAnswerOption =
          await this.answerOptionRepository.createAnswerOptions(
            newQuestionId,
            { ...option, businessId },
            option.index,
            tx,
          );

        if (option.answerOptionOnMedia) {
          const media = await this.mediaRepository.getMediaById(
            option.answerOptionOnMedia.mediaId,
            tx,
          );
          if (media) {
            await this.mediaRepository.createAnswerOptionOnMedia(
              [{ mediaId: media.id, answerOptionId: newAnswerOption.id }],
              tx,
            );
          }
        }
        return newAnswerOption;
      }),
    );
  }

  private async duplicateQuestionMedia(
    originalQuestionId: number,
    newQuestionId: number,
    tx?: any,
  ) {
    const media = await this.mediaRepository.getQuestionOnMediaByQuestionId(
      originalQuestionId,
      tx,
    );
    if (media) {
      await this.mediaRepository.createQuestionOnMedia(
        { mediaId: media.id, questionId: newQuestionId },
        tx,
      );
    }
  }

  private async duplicateSurveySettings(
    originalFormId: number,
    newFormId: number,
    businessId: number,
    tx?: any,
  ) {
    const surveySettings =
      await this.settingRepository.getAllFormSettingBusiness(
        businessId,
        originalFormId,
        tx,
      );
    if (surveySettings.length > 0) {
      await Promise.all(
        surveySettings.map((setting) =>
          this.settingRepository.saveSetting(
            newFormId,
            businessId,
            setting.key,
            setting.value,
            setting.formSettingId,
            tx,
          ),
        ),
      );
    }
  }

  async updateSurveyEnding(
    surveyId: number,
    ending: { message: string; redirectUrl: string },
    request?: any,
  ) {
    const tx = request?.tx;
    const survey = await this.formRepository.getSurveyFeedbackById(
      surveyId,
      tx,
    );
    if (!survey) {
      throw new NotFoundException(
        this.i18n.translate('errors.SURVEYIDNOTEXISTING'),
      );
    }

    const existingEnding =
      await this.surveyEndingRepository.getSurveyEndingBySurveyId(surveyId, tx);
    if (existingEnding) {
      return this.surveyEndingRepository.updateSurveyEnding(
        surveyId,
        ending,
        tx,
      );
    }
    return this.surveyEndingRepository.createSurveyEnding(
      {
        formId: survey.id,
        message: ending.message,
        redirectUrl: ending.redirectUrl,
      },
      tx,
    );
  }

  async saveForm(
    formId: number,
    updateFormDto: UpdatesurveyFeedbackDto,
    updateQuestionDto: UpdateQuestionDto[],
    request?: any,
  ) {
    const tx = request?.tx;
    const form = await this.formRepository.getSurveyFeedbackById(formId, tx);
    if (!form) {
      throw new NotFoundException(
        this.i18n.translate('errors.SURVEYIDNOTEXISTING'),
      );
    }

    await this.formRepository.updateSurveyFeedback(formId, updateFormDto, tx);
    const questions = await this.questionSerivce.addAndUpdateQuestions(
      form.id,
      updateQuestionDto,
      tx,
    );
    const ending = await this.updateSurveyEnding(
      form.id,
      {
        message: updateFormDto.endingMessage,
        redirectUrl: updateFormDto.endingRedirectUrl,
      },
      { tx },
    );

    return {
      message: 'Survey saved successfully',
      data: { form, questions, ending },
    };
  }
}
