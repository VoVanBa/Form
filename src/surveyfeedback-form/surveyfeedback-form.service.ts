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
import { QuestionConditionService } from 'src/question-condition/question-condition.service';
import { QuestionRole } from 'src/models/enums/QuestionRole';

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
    private questionCondition: QuestionConditionService,
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

    if (surveyFeedback.status !== FormStatus.PUBLISHED) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYNOTAVAILABLE'),
      );
    }

    const surveyEnding =
      await this.surveyEndingRepository.getSurveyEndingBySurveyId(id, tx);

    // 1️⃣ **Tạo logic map: ánh xạ `questionLogicId` với `sources` và `targets`**
    const logicMap = new Map();

    surveyFeedback.questions.forEach((question) => {
      question.questionConditions.forEach((condition) => {
        if (condition.questionLogicId) {
          const key = condition.questionLogicId;
          if (!logicMap.has(key)) {
            logicMap.set(key, { sources: [], targets: [] });
          }

          if (condition.role === 'SOURCE') {
            logicMap.get(key).sources.push({
              id: condition.questionId,
              headline: question.headline, // Thêm headline của câu hỏi vào source
            });
          } else if (condition.role === 'TARGET') {
            logicMap.get(key).targets.push({
              id: condition.questionId,
              headline: question.headline, // Thêm headline của câu hỏi vào target
            });
          }
        }
      });
    });

    // 2️⃣ **Hàm ánh xạ điều kiện logic**
    const mapCondition = (condition) => {
      const logic = logicMap.get(condition.questionLogicId);
      return {
        source: {
          questionId: logic?.sources?.[0]?.id || null, // Lấy questionId của source
          questionHeadline: logic?.sources?.[0]?.headline || null, // Lấy headline của source
          operator: condition.questionLogic?.conditionType || 'equals',
          value: condition.questionLogic?.conditionValue || null,
        },
        target: {
          questionId: logic?.targets?.[0]?.id || null, // Lấy questionId của target
          questionHeadline: logic?.targets?.[0]?.headline || null, // Lấy headline của target
        },
      };
    };

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
        questionCondition: question.questionConditions
          .filter((condition) => condition.role !== 'TARGET') // Chỉ giữ lại điều kiện không phải TARGET
          .map(mapCondition), // Ánh xạ điều kiện logic
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
  private matchCondition(
    questionType: string,
    conditionLogic: any,
    responseDto: any,
  ): boolean {
    if (!conditionLogic || !responseDto) return false;

    const conditionValue = conditionLogic.conditionValue;
    const conditionType = conditionLogic.conditionType;

    switch (questionType) {
      case 'SINGLE_CHOICE':
        return conditionValue.answerOptionId === responseDto.answerOptionId;

      case 'MULTI_CHOICE':
        if (!Array.isArray(responseDto.answerOptionId)) return false;
        switch (conditionType) {
          case 'CONTAINS':
            return responseDto.answerOptionId.includes(
              conditionValue.answerOptionId,
            );
          case 'NOT_CONTAINS':
            return !responseDto.answerOptionId.includes(
              conditionValue.answerOptionId,
            );
          default:
            return false;
        }

      case 'RATING_SCALE':
        const rating = responseDto.ratingValue;
        switch (conditionType) {
          case 'EQUALS':
            return rating === conditionValue.value;
          case 'GREATER_THAN':
            return rating > conditionValue.value;
          case 'LESS_THAN':
            return rating < conditionValue.value;
          case 'BETWEEN':
            return rating >= conditionValue.min && rating <= conditionValue.max;
          default:
            return false;
        }

      case 'INPUT_TEXT':
        const text = responseDto.answer;
        switch (conditionType) {
          case 'EQUALS':
            return text === conditionValue.value;
          case 'CONTAINS':
            return text.includes(conditionValue.value);
          default:
            return false;
        }

      default:
        return false;
    }
  }

  async getFormByIdForClient(id: number, request?: any, user?: number) {
    const userId = user; // userId từ token nếu đăng nhập
    const sessionId = request?.sessionId || this.generateSessionId(); // Sinh sessionId nếu ẩn danh

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

    console.log('userResponses sjasdjasdjasdjasdjasjd', userResponses);
    const answeredQuestionIds = userResponses?.responseOnQuestions?.length
      ? userResponses.responseOnQuestions.map((r) => r.questionId)
      : [];

    // Tìm câu hỏi chưa trả lời tiếp theo
    const sortedQuestions = surveyFeedback.questions.sort(
      (a, b) => a.index - b.index,
    );

    const currentQuestion =
      sortedQuestions.find((q) => !answeredQuestionIds.includes(q.id)) ||
      sortedQuestions[0] ||
      null;

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

  async submitResponseForClient(
    id: number,
    responseDto: {
      questionId: number;
      answer?: string;
      answerOptionId?: number | number[];
      ratingValue?: number;
    },
    request?: any,
    user?: number,
  ) {
    const tx = request?.tx;
    const userId = user;
    const sessionId = request?.headers?.['x-session-id'];

    const surveyFeedback = await this.formRepository.getSurveyFeedbackById(
      id,
      tx,
    );
    if (!surveyFeedback) {
      throw new NotFoundException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }

    const currentQuestion = surveyFeedback.questions.find(
      (q) => q.id === responseDto.questionId,
    );
    if (!currentQuestion) {
      throw new NotFoundException(
        this.i18n.translate('errors.QUESTIONNOTFOUND'),
      );
    }

    const settings = await this.questionSerivce.getQuestionSettingByQuestionId(
      currentQuestion.id,
    );

    const validatedResponseDto = {
      ...responseDto,
      answerOptionId: Array.isArray(responseDto.answerOptionId)
        ? responseDto.answerOptionId
        : responseDto.answerOptionId !== undefined
          ? [responseDto.answerOptionId]
          : [],
    };

    await this.responseService.validateQuestionResponses(
      validatedResponseDto,
      settings,
    );

    await this.responseService.createResponse(
      id,
      responseDto.questionId,
      responseDto,
      userId,
      sessionId,
    );

    // Xử lý logic điều kiện
    const conditions = currentQuestion.questionConditions.filter(
      (c) => c.role === 'SOURCE',
    );
    let nextQuestion = null;

    if (conditions.length > 0) {
      // Xử lý theo loại câu hỏi
      const matchedCondition = conditions.find((c) => {
        const conditionValue = (() => {
          console.log(c.questionLogic?.conditionValue);
          return c.questionLogic?.conditionValue;
        })();

        console.log(conditionValue.answerOptionId);
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
        const getTargetQuestionId =
          await this.questionCondition.getTargeByLogiId(
            matchedCondition.questionLogic.id,
            QuestionRole.TARGET,
          );

        if (getTargetQuestionId) {
          const question = surveyFeedback.questions.find(
            (q) => q.id === getTargetQuestionId.questionId,
          );

          nextQuestion = await this.questionSerivce.getQuestionById(
            question.id,
          );
        }
      }
    }

    if (!nextQuestion) {
      const allQuestions = await this.questionSerivce.getAllQuestion(id);

      // Lấy index theo mảng (bắt đầu từ 0)
      const currentIndex = allQuestions.findIndex(
        (q) => q.id === currentQuestion.id,
      );

      // Đảm bảo index hợp lệ trước khi lấy câu tiếp theo
      if (currentIndex !== -1 && currentIndex + 1 < allQuestions.length) {
        nextQuestion = allQuestions[currentIndex + 1]; // Lấy trực tiếp từ mảng
      }
    }

    const surveyEnding =
      await this.surveyEndingRepository.getSurveyEndingBySurveyId(id);

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
  async goBackToPreviousQuestion(
    id: number,
    currentQuestionId: number,
    request?: any,
    user?: number,
  ) {
    const tx = request?.tx;
    const userId = user;
    const sessionId = request?.headers?.['x-session-id'];

    const surveyFeedback = await this.formRepository.getSurveyFeedbackById(
      id,
      tx,
    );
    if (!surveyFeedback) {
      throw new NotFoundException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }

    const currentQuestion = surveyFeedback.questions.find(
      (q) => q.id === currentQuestionId,
    );
    if (!currentQuestion) {
      throw new NotFoundException(
        this.i18n.translate('errors.QUESTIONNOTFOUND'),
      );
    }

    const userResponses =
      await this.responseRepository.getResponsesBySurveyAndUser(
        id,
        userId,
        sessionId,
      );

    const responseHistory = userResponses.responseOnQuestions.sort(
      (a, b) => a.createdAt - b.createdAt,
    );
    console.log(
      'Response History:',
      responseHistory.map((r) => ({
        questionId: r.questionId,
        createdAt: r.createdAt,
      })),
    );

    const currentResponseIndex = responseHistory.findIndex(
      (response) => response.questionId === currentQuestionId,
    );
    console.log(
      'Current Question ID:',
      currentQuestionId,
      'Index in history:',
      currentResponseIndex,
    );

    let prevQuestion;
    let previousResponse;

    if (currentResponseIndex === -1) {
      // Chưa trả lời câu hiện tại
      if (responseHistory.length > 0) {
        // Lấy câu hỏi cuối cùng trong lịch sử trả lời
        previousResponse = responseHistory[responseHistory.length - 1];
        prevQuestion = surveyFeedback.questions.find(
          (q) => q.id === previousResponse.questionId,
        );
      } else {
        // Chưa trả lời câu nào, thử tìm câu hỏi trước dựa trên điều kiện hoặc index
        prevQuestion = await this.responseService.getPreviousQuestion(
          id,
          currentQuestionId,
          userResponses.id,
          sessionId,
          tx,
        );
        if (!prevQuestion) {
          throw new BadRequestException(
            this.i18n.translate('errors.NOPREVIOUSQUESTION'),
          );
        }
      }
    } else if (currentResponseIndex <= 0) {
      // Là câu đầu tiên trong lịch sử, không thể quay lại
      throw new BadRequestException(
        this.i18n.translate('errors.NOPREVIOUSQUESTION'),
      );
    } else {
      // Đã trả lời, lấy câu hỏi trước đó trong lịch sử
      previousResponse = responseHistory[currentResponseIndex - 1];
      prevQuestion = surveyFeedback.questions.find(
        (q) => q.id === previousResponse.questionId,
      );
    }

    if (!prevQuestion) {
      throw new NotFoundException(
        this.i18n.translate('errors.QUESTIONNOTFOUND'),
      );
    }

    const previousAnswer = previousResponse
      ? this.formatPreviousAnswer(prevQuestion.questionType, previousResponse)
      : null;

    return {
      surveyId: surveyFeedback.id,
      surveyName: surveyFeedback.name,
      sessionId,
      currentQuestion: {
        id: prevQuestion.id,
        text: prevQuestion.headline,
        type: prevQuestion.questionType,
        index: prevQuestion.index,
        media: prevQuestion.questionOnMedia?.media
          ? {
              id: prevQuestion.questionOnMedia.media.id,
              url: prevQuestion.questionOnMedia.media.url,
            }
          : null,
        answerOptions: prevQuestion.answerOptions.map((ao) => ({
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
        setting: prevQuestion.businessQuestionConfiguration?.settings || {},
        previousAnswer: previousAnswer,
      },
      isLastQuestion: false,
      ending: null,
    };
  }

  // Hàm phụ trợ để định dạng câu trả lời trước đó theo loại câu hỏi
  private formatPreviousAnswer(questionType: string, response: any) {
    switch (questionType) {
      case 'SINGLE_CHOICE':
        return {
          answerOptionId: response.answerOptionId,
        };

      case 'MULTI_CHOICE':
        // Lưu ý: Với MULTI_CHOICE, bạn cần lấy tất cả câu trả lời của câu hỏi này
        return {
          answerOptionId: [response.answerOptionId],
        };

      case 'RATING_SCALE':
        return {
          ratingValue: response.ratingValue,
        };

      case 'INPUT_TEXT':
        return {
          answer: response.answerText,
        };

      case 'PICTURE_SELECTION':
        return {
          answerOptionId: response.answerOptionId,
        };

      default:
        return null;
    }
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
    const questions = await this.questionSerivce.getAllQuestion(originalFormId);
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
  ) {
    const survey = await this.formRepository.getSurveyFeedbackById(surveyId);
    if (!survey) {
      throw new NotFoundException(
        this.i18n.translate('errors.SURVEYIDNOTEXISTING'),
      );
    }

    const existingEnding =
      await this.surveyEndingRepository.getSurveyEndingBySurveyId(surveyId);
    if (existingEnding) {
      return this.surveyEndingRepository.updateSurveyEnding(surveyId, ending);
    }
    return this.surveyEndingRepository.createSurveyEnding({
      formId: survey.id,
      message: ending.message,
      redirectUrl: ending.redirectUrl,
    });
  }

  async saveForm(
    formId: number,
    updateFormDto: UpdatesurveyFeedbackDto,
    updateQuestionDto: UpdateQuestionDto[],
  ) {
    const form = await this.formRepository.getSurveyFeedbackById(formId);
    if (!form) {
      throw new NotFoundException(
        this.i18n.translate('errors.SURVEYIDNOTEXISTING'),
      );
    }

    await this.formRepository.updateSurveyFeedback(formId, updateFormDto);
    const questions = await this.questionSerivce.addAndUpdateQuestions(
      form.id,
      updateQuestionDto,
    );
    const ending = await this.updateSurveyEnding(form.id, {
      message: updateFormDto.endingMessage,
      redirectUrl: updateFormDto.endingRedirectUrl,
      mediaId: updateFormDto.endingMediaId,
    });

    return {
      message: this.i18n.translate('errors.FORM_SAVED_SUCCESSFULLY'),
      data: { form, questions, ending },
    };
  }
}
