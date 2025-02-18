import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismasurveyFeedbackRepository } from 'src/repositories/prisma-survey-feeback.repository';
import { CreatesurveyFeedbackDto } from './dtos/create.form.dto';
import { UpdatesurveyFeedbackDto } from './dtos/update.form.dto';
import { PrismaBusinessRepository } from 'src/repositories/prims-business.repository';

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

@Injectable()
export class SurveyFeedackFormService {
  constructor(
    private formRepository: PrismasurveyFeedbackRepository,
    private businessRepository: PrismaBusinessRepository,
    private formSetting: PrismaFormSettingRepository,
    private questionRepository: PrismaQuestionRepository,
    private answerOptionRepository: PrismaAnswerOptionRepository,
    private mediaRepository: PrismaMediaRepository,
    private settingRepository: PrismaFormSettingRepository,
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
    const form = await this.formRepository.getAllsurveyFeedbacks(businessId);
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

  async getFormByIdForBusiness(id: number) {
    // Kiểm tra xem surveyFeedback có được tìm thấy hay không
    const surveyFeedback = await this.formRepository.getsurveyFeedbackById(id);

    if (!surveyFeedback) {
      throw new NotFoundException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }

    console.log(surveyFeedback, 'survey');

    console.log('head', surveyFeedback.questions, 'surveyFeedback'); // Thêm log để kiểm tra dữ liệu của surveyFeedback

    const surveyFeedbackDto = {
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

        setting: question.businessQuestionConfiguration.settings,
      })),
    };

    return surveyFeedbackDto;
  }

  async getFormByIdForClient(id: number) {
    // Kiểm tra xem surveyFeedback có được tìm thấy hay không
    const surveyFeedback = await this.formRepository.getsurveyFeedbackById(id);

    if (!surveyFeedback) {
      throw new NotFoundException(
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
      throw new NotFoundException(
        this.i18n.translate('errors.BUSINESSNOTFOUND'),
      );
    }

    const existingForm = await this.getFormByIdForBusiness(formId);
    if (!existingForm) {
      throw new NotFoundException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }
    return await this.formRepository.updateStatus(status as FormStatus, formId);
    // return await this.formRepository.updateStatus(status, formId);
  }

  async updateSurveyallowAnonymous(surveyId: number, active: boolean) {
    const survey = await this.formRepository.getsurveyFeedbackById(surveyId);
    if (!survey) {
      throw new NotFoundException(
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
  async duplicateSurvey(id: number, businessId: number) {
    const formExisting = await this.formRepository.getsurveyFeedbackById(id);
    if (!formExisting) {
      throw new NotFoundException(
        this.i18n.translate('errors.SURVEYIDNOTEXISTING'),
      );
    }

    const newForm = await this.formRepository.createsurveyFeedback(
      {
        ...formExisting,
        id: undefined, // Không sao chép ID cũ
        name: `${formExisting.name} (Copy)`,
        status: FormStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      businessId,
    );

    const questions = await this.questionRepository.findAllQuestion(
      formExisting.id,
    );

    for (const question of questions) {
      const addQuestionDto: AddQuestionDto = {
        headline: question.headline,
        questionType: question.questionType,
      };

      const newQuestion = await this.questionRepository.createQuestion(
        newForm.id,
        addQuestionDto,
        question.index,
      );

      const answerOptions =
        await this.answerOptionRepository.getAllAnserOptionbyQuestionId(
          question.id,
        );

      // ✅ Tạo AnswerOptions mới song song
      await Promise.all(
        answerOptions.map(async (option) => {
          // ✅ Nếu có media kèm theo, sao chép nó
          if (option.answerOptionOnMedia) {
            const media = await this.mediaRepository.getMediaById(
              option.answerOptionOnMedia.mediaId,
            );

            await this.mediaRepository.createAnswerOptionOnMedia([
              {
                mediaId: media.id,
                answerOptionId: newQuestion.id,
              },
            ]);
          }

          return this.answerOptionRepository.createAnswerOptions(
            newQuestion.id,
            {
              ...option,
              businessId: businessId,
            },
            option.index,
          );
        }),
      );

      if (question.questionOnMedia) {
        const media = await this.mediaRepository.getQuestionOnMediaByMediaId(
          question.questionOnMedia.id,
        );

        await this.mediaRepository.createQuestionOnMedia({
          mediaId: media.id,
          questionId: newQuestion.id,
        });
      }

      // ✅ Nếu câu hỏi có cấu hình riêng, sao chép nó
      if (question.businessQuestionConfiguration) {
        await this.questionRepository.createQuestionSettings(
          newQuestion.id,
          question.businessQuestionConfiguration.settings,
          question.businessQuestionConfiguration.key,
          newForm.id,
        );
      }
    }

    // ✅ Lấy và sao chép tất cả cài đặt survey nếu có
    const surveySettings =
      await this.settingRepository.getAllFormSettingBusiness(
        businessId,
        formExisting.id,
      );

    if (surveySettings.length > 0) {
      await Promise.all(
        surveySettings.map((setting) =>
          this.settingRepository.saveSetting(
            newForm.id,
            businessId,
            setting.key,
            setting.value,
            setting.formSettingId,
          ),
        ),
      );
    }

    return newForm;
  }
}
