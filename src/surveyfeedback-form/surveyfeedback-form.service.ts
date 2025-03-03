import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatesurveyFeedbackDto } from './dtos/create.form.dto';
import { UpdatesurveyFeedbackDto } from './dtos/update.form.dto';
import { v4 as uuidv4 } from 'uuid';
import { FormStatus } from 'src/models/enums/FormStatus';
import { PrismaFormSettingRepository } from 'src/repositories/prisma-setting.repository';
import { FormSettingTypeResponse } from 'src/response-customization/survey-feedback-setting-response';
import { I18nService } from 'nestjs-i18n';
import { AddQuestionDto } from 'src/question/dtos/add.question.dto';
import { PrismaSurveyEndingRepository } from 'src/repositories/prisma-survey-feedback-ending-repository';
import { BusinessService } from 'src/business/business.service';
import { UpdateQuestionDto } from 'src/question/dtos/update.question.dto';
import { PrismaSurveyFeedbackRepository } from 'src/repositories/prisma-survey-feeback.repository';
import { plainToInstance } from 'class-transformer';
import { MediaService } from 'src/media/media.service';
import { QuestionService } from 'src/question/question.service';
import { AnswerOptionService } from 'src/answer-option/answer-option.service';
import { PrismaUserResponseRepository } from 'src/repositories/prisma-user-response.repository';
import { SurveyFeedbackDataService } from 'src/survey-feedback-data/survey-feedback-data.service';

@Injectable()
export class SurveyFeedackFormService {
  constructor(
    private formRepository: PrismaSurveyFeedbackRepository,
    private businessService: BusinessService,
    private answerOptionService: AnswerOptionService,
    private mediaService: MediaService,
    private settingRepository: PrismaFormSettingRepository,
    private surveyEndingRepository: PrismaSurveyEndingRepository,
    @Inject(forwardRef(() => QuestionService))
    private questionSerivce: QuestionService,
    private readonly i18n: I18nService,
    private responseRepository: PrismaUserResponseRepository,
    private responseService: SurveyFeedbackDataService,
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

    const formSetting = await this.settingRepository.getAllFormSetting(tx);
    const saveSettingsPromises = formSetting.map((form) =>
      this.settingRepository.saveSetting(
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

  async getSurveyFeedbackById(formId: number) {
    return this.formRepository.getSurveyFeedbackById(formId);
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
  private generateSessionId(): string {
    return uuidv4();
  }
  async getFormByIdForClient(id: number, request?: any) {
    const userId = request?.user?.id; // userId từ token nếu đăng nhập
    let sessionId = request?.sessionId || this.generateSessionId(); // Sinh sessionId nếu ẩn danh

    // Lấy thông tin khảo sát
    const surveyFeedback = await this.formRepository.getSurveyFeedbackById(id);
    if (!surveyFeedback) {
      throw new NotFoundException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }
    if (surveyFeedback.status !== 'PUBLISHED') {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYNOTAVAILABLE'),
      );
    }

    const surveyEnding =
      await this.surveyEndingRepository.getSurveyEndingBySurveyId(id);

    // Lấy phản hồi của client cụ thể
    const userResponses =
      await this.responseRepository.getResponsesBySurveyAndUser(
        id,
        userId,
        sessionId,
      );
    const answeredQuestionIds = userResponses.responseOnQuestions.map(
      (r) => r.questionId,
    );

    // Tìm câu hỏi chưa trả lời tiếp theo
    const currentQuestion =
      surveyFeedback.questions
        .sort((a, b) => a.index - b.index)
        .find((q) => !answeredQuestionIds.includes(q.id)) || null;

    const response: {
      surveyId: number;
      surveyName: string;
      currentQuestion: {
        id: number;
        text: string;
        type: string;
        index: number;
        media: { id: number; url: string } | null;
        answerOptions: {
          id: number;
          label: string;
          index: number;
          media: { id: number; url: string } | null;
        }[];
        setting: any;
      } | null;
      isLastQuestion: boolean;
      ending: {
        message: string;
        redirectUrl: string | null;
        media: { id: number; url: string } | null;
      } | null;
      sessionId?: string;
    } = {
      surveyId: surveyFeedback.id,
      surveyName: surveyFeedback.name,
      currentQuestion: currentQuestion
        ? {
            id: currentQuestion.id,
            text: currentQuestion.headline,
            type: currentQuestion.questionType,
            index: currentQuestion.index,
            media: currentQuestion.questionOnMedia?.media
              ? {
                  id: currentQuestion.questionOnMedia.media.id,
                  url: currentQuestion.questionOnMedia.media.url,
                }
              : null,
            answerOptions: currentQuestion.answerOptions.map((ao) => ({
              id: ao.id,
              label: ao.label,
              index: ao.index,
              media: ao.answerOptionOnMedia?.media
                ? {
                    id: ao.answerOptionOnMedia.media.id,
                    url: ao.answerOptionOnMedia.media.url,
                  }
                : null,
            })),
            setting:
              currentQuestion.businessQuestionConfiguration?.settings || {},
          }
        : null,
      isLastQuestion:
        !currentQuestion ||
        currentQuestion.index === surveyFeedback.questions.length,
      ending:
        !currentQuestion && surveyEnding
          ? {
              message: surveyEnding.message,
              redirectUrl: surveyEnding.redirectUrl || null,
              media: surveyEnding.media
                ? { id: surveyEnding.media.id, url: surveyEnding.media.url }
                : null,
            }
          : null,
    };

    // Gửi sessionId cho client nếu ẩn danh
    if (!userId && surveyFeedback.allowAnonymous) {
      response.sessionId = sessionId;
    }
    return response;
  }

  // Hàm POST để gửi phản hồi
  async submitResponseForClient(
    id: number,
    responseDto: {
      questionId: number;
      answer?: string;
      answerOptionId?: number | number[];
      ratingValue?: number;
    },
    request?: any,
  ) {
    const tx = request?.tx;
    const userId = request?.user?.id;
    const sessionId = request?.sessionId;

    const surveyFeedback = await this.formRepository.getSurveyFeedbackById(
      id,
      tx,
    );
    if (!surveyFeedback) {
      throw new NotFoundException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }

    // Save response
    await this.responseService.createResponse(
      id,
      responseDto.questionId,
      responseDto, // Truyền toàn bộ responseDto để có thể lưu các loại câu trả lời khác nhau
      userId,
      sessionId,
    );

    // Tìm câu hỏi hiện tại
    const currentQuestion = surveyFeedback.questions.find(
      (q) => q.id === responseDto.questionId,
    );
    if (!currentQuestion) {
      throw new NotFoundException(
        this.i18n.translate('errors.QUESTIONNOTFOUND'),
      );
    }

    // Xử lý logic điều kiện
    const conditions = currentQuestion.questionConditions.filter(
      (c) => c.role === 'SOURCE',
    );
    let nextQuestion = null;

    if (conditions.length > 0) {
      // Xử lý theo loại câu hỏi
      const matchedCondition = conditions.find((c) => {
        const conditionValue = c.questionLogic?.conditionValue
          ? JSON.parse(c.questionLogic.conditionValue)
          : {};

        switch (currentQuestion.questionType) {
          case 'SINGLE_CHOICE':
            return conditionValue.answerOptionId === responseDto.answerOptionId;

          case 'MULTI_CHOICE':
            if (Array.isArray(responseDto.answerOptionId)) {
              if (c.questionLogic?.conditionType === 'CONTAINS') {
                return responseDto.answerOptionId.includes(
                  conditionValue.answerOptionId,
                );
              } else if (c.questionLogic?.conditionType === 'NOT_CONTAINS') {
                return !responseDto.answerOptionId.includes(
                  conditionValue.answerOptionId,
                );
              }
            }
            return false;

          case 'RATING_SCALE':
            const rating = responseDto.ratingValue;
            if (c.questionLogic?.conditionType === 'EQUALS') {
              return rating === conditionValue.value;
            } else if (c.questionLogic?.conditionType === 'GREATER_THAN') {
              return rating > conditionValue.value;
            } else if (c.questionLogic?.conditionType === 'LESS_THAN') {
              return rating < conditionValue.value;
            } else if (c.questionLogic?.conditionType === 'BETWEEN') {
              return (
                rating >= conditionValue.min && rating <= conditionValue.max
              );
            }
            return false;

          case 'INPUT_TEXT':
            const text = responseDto.answer;
            if (c.questionLogic?.conditionType === 'EQUALS') {
              return text === conditionValue.value;
            } else if (c.questionLogic?.conditionType === 'CONTAINS') {
              return text.includes(conditionValue.value);
            }
            return false;

          default:
            return false;
        }
      });

      if (matchedCondition) {
        // Tìm câu hỏi TARGET tương ứng với điều kiện
        const targetQuestionId =
          matchedCondition.questionLogic?.conditionValue?.targetQuestionId;
        if (targetQuestionId) {
          nextQuestion = surveyFeedback.questions.find(
            (q) => q.id === targetQuestionId,
          );
        }
      }
    }

    // Nếu không có điều kiện phù hợp, lấy câu hỏi tiếp theo theo thứ tự
    if (!nextQuestion) {
      const nextIndex = currentQuestion.index + 1;
      nextQuestion = surveyFeedback.questions.find(
        (q) => q.index === nextIndex,
      );
    }

    // Lấy thông tin kết thúc khảo sát
    const surveyEnding =
      await this.surveyEndingRepository.getSurveyEndingBySurveyId(id, tx);

    // Tạo response
    const response = {
      surveyId: surveyFeedback.id,
      surveyName: surveyFeedback.name,
      sessionId,
      currentQuestion: nextQuestion
        ? {
            id: nextQuestion.id,
            text: nextQuestion.headline,
            type: nextQuestion.questionType,
            index: nextQuestion.index,
            media: nextQuestion.questionOnMedia?.media
              ? {
                  id: nextQuestion.questionOnMedia.media.id,
                  url: nextQuestion.questionOnMedia.media.url,
                }
              : null,
            answerOptions: nextQuestion.answerOptions.map((ao) => ({
              id: ao.id,
              label: ao.label,
              index: ao.index,
              media: ao.answerOptionOnMedia?.media
                ? {
                    id: ao.answerOptionOnMedia.media.id,
                    url: ao.answerOptionOnMedia.media.url,
                  }
                : null,
            })),
            setting: nextQuestion.businessQuestionConfiguration?.settings || {},
          }
        : null,
      isLastQuestion:
        !nextQuestion || nextQuestion.index === surveyFeedback.questions.length,
      ending:
        !nextQuestion && surveyEnding
          ? {
              message: surveyEnding.message,
              redirectUrl: surveyEnding.redirectUrl || null,
              media: surveyEnding.media
                ? { id: surveyEnding.media.id, url: surveyEnding.media.url }
                : null,
            }
          : null,
    };

    if (!userId && surveyFeedback.allowAnonymous) {
      response.sessionId = sessionId;
    }

    return response;
  }
  async getFormByIdForClientFeedBack(id: number, request?: any) {
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

    // Create a map to track logic connections (matching by questionLogicId)
    const logicMap = new Map();

    // First pass: collect all condition logic
    surveyFeedback.questions.forEach((question) => {
      question.questionConditions.forEach((condition) => {
        if (condition.questionLogicId) {
          const key = condition.questionLogicId;
          if (!logicMap.has(key)) {
            logicMap.set(key, { sources: [], targets: [] });
          }

          if (condition.role === 'SOURCE') {
            logicMap.get(key).sources.push(condition.questionId);
          } else if (condition.role === 'TARGET') {
            logicMap.get(key).targets.push(condition.questionId);
          }
        }
      });
    });

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
        questionCondition: question.questionConditions.map((condition) => {
          const result = {
            id: condition.id,
            role: condition.role,
            relatedTargetQuestion: condition.questionId,
            questionLogic: condition.questionLogic
              ? {
                  conditionType: condition.questionLogic.conditionType,
                  conditionValue: condition.questionLogic.conditionValue,
                  logicalOperator: condition.questionLogic.logicalOperator,
                }
              : null,
          };

          // Add appropriate related question IDs based on role
          if (condition.role === 'SOURCE') {
            // Find the matching TARGET questions with the same logic
            if (
              condition.questionLogicId &&
              logicMap.has(condition.questionLogicId)
            ) {
              result.relatedTargetQuestion =
                logicMap.get(condition.questionLogicId).targets[0] || null;
            } else {
              result.relatedTargetQuestion = null;
            }
          } else if (condition.role === 'TARGET') {
            // Find the matching SOURCE questions with the same logic
            if (
              condition.questionLogicId &&
              logicMap.has(condition.questionLogicId)
            ) {
              result.relatedTargetQuestion =
                logicMap.get(condition.questionLogicId).sources[0] || null;
            } else {
              result.relatedTargetQuestion = null;
            }
          }

          return result;
        }),
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
    const allFormSettings = await this.settingRepository.getAllFormSetting(tx);
    const currentSettings = await this.settingRepository.getDefaultSetting(
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
      return this.settingRepository.upsertSetting(
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
    const businessSettings =
      await this.settingRepository.getAllBusinessSettingTypes(
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
    const questions =
      await this.questionSerivce.findAllQuestion(originalFormId);
    for (const question of questions) {
      const addQuestionDto: AddQuestionDto = {
        headline: question.headline,
        questionType: question.questionType,
      };
      const newQuestion = await this.questionSerivce.createQuestion(
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
        await this.questionSerivce.createQuestionSettings(
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
      await this.answerOptionService.getAllAnserOptionbyQuestionId(
        originalQuestionId,
      );
    return Promise.all(
      answerOptions.map(async (option) => {
        const newAnswerOption =
          await this.answerOptionService.createAnswerOptions(
            newQuestionId,
            { ...option, businessId },
            option.index,
            tx,
          );

        if (option.answerOptionOnMedia) {
          const media = await this.mediaService.getMediaById(
            option.answerOptionOnMedia.mediaId,
            tx,
          );
          if (media) {
            await this.mediaService.createAnswerOptionOnMedia(
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
    const media = await this.mediaService.getQuestionOnMediaByQuestionId(
      originalQuestionId,
      tx,
    );
    if (media) {
      await this.mediaService.createQuestionOnMedia(
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
    ending: { message: string; redirectUrl: string; mediaId: number },
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
    const tx = request?.transaction;
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
        mediaId: updateFormDto.endingMediaId,
      },
      { tx },
    );

    return {
      message: this.i18n.translate('errors.FORM_SAVED_SUCCESSFULLY'),
      data: { form, questions, ending },
    };
  }
}
