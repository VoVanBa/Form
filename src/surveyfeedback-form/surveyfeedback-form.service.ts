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
import { FormStatus } from 'src/surveyfeedback-form/entities/enums/FormStatus';
import { I18nService } from 'nestjs-i18n';
import { AddQuestionDto } from 'src/question/dtos/add.question.dto';
import { PrismaSurveyEndingRepository } from 'src/surveyfeedback-form/repositories/prisma-survey-feedback-ending-repository';
import { BusinessService } from 'src/business/business.service';
import { UpdateQuestionDto } from 'src/question/dtos/update.question.dto';
import { MediaService } from 'src/media/services/media.service';
import { QuestionService } from 'src/question/service/question.service';
import { AnswerOptionService } from 'src/answer-option/answer-option.service';
import { SurveyFeedbackDataService } from 'src/survey-feedback-data/survey-feedback-data.service';
import { QuestionRole } from 'src/question/entities/enums/QuestionRole';
import { QuestionMediaService } from 'src/media/services/question-media.service';
import { AnswerOptionMediaService } from 'src/media/services/answer-option-media.service';
import { PrismaSurveyFeedbackRepository } from './repositories/prisma-survey-feeback.repository';
import { SurveyFeedbackType } from './entities/enums/SurveyFeedbackType';
import { UpdateFormEndingDto } from './dtos/update.form.ending.dto';
import { SurveyFeedbackSettingService } from 'src/settings/service/survey-feedback-setting.service';
import { UpdateSettingDto } from 'src/settings/dtos/survey-feedback-settings.dto';
import { SurveySettingKey } from 'src/settings/entities/enums/SurveySettingKey';
import { QuestionConfigurationService } from 'src/settings/service/question-configuaration.service';
import { QuestionLogicService } from 'src/question/service/question-condition.service';
import { ResponseDto } from 'src/survey-feedback-data/dtos/response.dto';

@Injectable()
export class SurveyFeedackFormService {
  constructor(
    private formRepository: PrismaSurveyFeedbackRepository,
    private businessService: BusinessService,
    private answerOptionService: AnswerOptionService,
    private surveyFeedbackSettingService: SurveyFeedbackSettingService,
    private surveyEndingRepository: PrismaSurveyEndingRepository,
    @Inject(forwardRef(() => QuestionService))
    private questionSerivce: QuestionService,
    private readonly i18n: I18nService,
    private responseService: SurveyFeedbackDataService,
    private mediaService: MediaService,
    private questionMediaService: QuestionMediaService,
    private answerOptionMediaService: AnswerOptionMediaService,
    private questionSettingService: QuestionConfigurationService,
    private questionLogicService: QuestionLogicService,
  ) {}

  async validateForm(formId: number) {
    const form = await this.formRepository.getSurveyFeedbackById(formId);
    if (!form) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }
    return form;
  }

  async createForm(createFormDto: CreatesurveyFeedbackDto, businessId: number) {
    const defaultSettings = Object.values(SurveySettingKey).map((key) => ({
      key,
      value: null,
    }));
    console.log(defaultSettings, 'dèautlasdjas');
    const save = await this.formRepository.createSurveyFeedback(
      createFormDto,
      businessId,
      defaultSettings,
    );

    await this.surveyEndingRepository.createSurveyEnding({
      formId: save.id,
      message: 'Cảm ơn quý khách đã trả lời khảo sát',
    });

    return this.i18n.translate('success.SURVEYFEEDBACKCREATED');
  }

  async getForms(businessId: number) {
    const form = await this.formRepository.getAllSurveyFeedbacks(businessId);

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

  async getBusinessFormById(id: number) {
    const surveyFeedback = await this.validateForm(id);
    const surveyEnding =
      await this.surveyEndingRepository.getSurveyEndingBySurveyId(id);

    // Tạo map từ questionId đến headline
    const questionHeadlineMap = {};
    surveyFeedback.questions.forEach((question) => {
      questionHeadlineMap[question.id] = question.headline;
    });
    const answerOptionLabelMap = {};
    surveyFeedback.questions.forEach((question) => {
      question.answerOptions.forEach((answerOption) => {
        answerOptionLabelMap[answerOption.id] = answerOption.label;
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
        setting: question.questionConfiguration?.settings || {},
        questionCondition: question.sourceLogics.map((condition) => ({
          id: condition.id,
          questionSourceId: condition.conditionValue.sourceQuestionId,
          headlineSource:
            questionHeadlineMap[condition.conditionValue.sourceQuestionId],
          actionType: condition.conditionType,
          action: {
            value: condition.actionType,
            answerOptionId: condition.conditionValue.answerOptionId,
            valueLabel:
              answerOptionLabelMap[condition.conditionValue.answerOptionId] ||
              null,
            jumpToQuestionId:
              condition.actionType === 'JUMP'
                ? condition.jumpToQuestionId
                : null,
            headlineTarget:
              condition.actionType === 'JUMP'
                ? questionHeadlineMap[condition.jumpToQuestionId]
                : null, // Headline của câu hỏi mục tiêu
          },
        })),
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

  async getSurveyEndingBySurveyId(id: number) {
    const surveyEnding =
      await this.surveyEndingRepository.getSurveyEndingBySurveyId(id);
    return surveyEnding;
  }

  async getClientFeedbackFormById(id: number) {
    const feedBack = await this.validateForm(id);
    if (feedBack.status !== FormStatus.PUBLISHED) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYNOTAVAILABLE'),
      );
    }
    if (feedBack.type !== SurveyFeedbackType.FEEDBACK) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYNOTAVAILABLE'),
      );
    }

    return {
      id: feedBack.id,
      name: feedBack.name,
      description: feedBack.description,
      type: feedBack.type,
      questions: feedBack.questions.map((question) => ({
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
        setting: question.questionConfiguration?.settings || {},
      })),
      // ending: surveyEnding
      //   ? {
      //       message: surveyEnding.message,
      //       redirectUrl: surveyEnding.redirectUrl || null,
      //       media: surveyEnding.media
      //         ? { id: surveyEnding.media.id, url: surveyEnding.media.url }
      //         : null,
      //     }
      //   : null,
    };
  }

  // Hàm hỗ trợ để ánh xạ điều kiện từ dữ liệu khảo sát sang định dạng mới
  private mapConditionToNewFormat(condition: any) {
    return {
      questionId: condition.questionId,
      questionSourceId: condition.questionSourceId,
      actionType: condition.action?.value || condition.actionType,
      conditionValue: {
        answerOptionId: condition.action?.answerOptionId,
        value: condition.action?.valueLabel,
      },
    };
  }
  async getSurveyForm(id: number, request?: any, user?: number) {
    const userId = user; // userId từ token nếu đăng nhập
    const sessionId = request?.sessionId;
    // Lấy thông tin khảo sát
    const surveyFeedback = await this.validateForm(id);
    if (
      surveyFeedback.status !== 'PUBLISHED' &&
      surveyFeedback.type !== 'SURVEY'
    ) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYNOTAVAILABLE'),
      );
    }

    const userResponses = await this.responseService.getPreviosResponse(
      id,
      userId,
      sessionId,
    );

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
            setting: currentQuestion.questionConfiguration?.settings || {},
          }
        : null,
      isLastQuestion: !currentQuestion,
      ending: !currentQuestion
        ? {
            message: surveyFeedback.ending.message,
            redirectUrl: surveyFeedback.ending.redirectUrl || null,
            media: surveyFeedback.ending.media
              ? {
                  id: surveyFeedback.ending.media.id,
                  url: surveyFeedback.ending.media.url,
                }
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

  async submitSurvey(
    id: number,
    responseDto: ResponseDto,
    request?: any,
    user?: number,
  ) {
    const userId = user;
    const sessionId = request?.headers?.['x-session-id'];

    const surveyData = await this.getSurveyData(id);
    if (!surveyData) throw new NotFoundException('Khảo sát không tồn tại');

    const { surveyFeedback, allQuestions, allConditions } = surveyData;

    const currentQuestion = allQuestions.find(
      (q) => q.id === responseDto.questionId,
    );
    if (!currentQuestion) {
      throw new NotFoundException(
        this.i18n.translate('errors.QUESTIONNOTFOUND'),
      );
    }

    const validatedResponseDto = {
      ...responseDto,
      answerOptionId: Array.isArray(responseDto.answerOptionId)
        ? responseDto.answerOptionId
        : responseDto.answerOptionId !== undefined
          ? [responseDto.answerOptionId]
          : [],
    };

    await this.questionSettingService.validateResponsesByQuestionSettings(
      validatedResponseDto,
      currentQuestion.questionConfiguration,
    );

    const userResponse = await this.responseService.createResponse(
      id,
      currentQuestion.id,
      responseDto,
      userId,
      sessionId,
    );
    console.log('User Response:', userResponse);

    const allResponses =
      await this.responseService.getAllResponsesByUserResponseId(
        userResponse.id,
      );

    console.log('All Responses:', allResponses);
    const questionVisibility = await this.calculateQuestionVisibility(
      allQuestions,
      allConditions,
      allResponses,
    );

    // console.log('Question Visibility:', questionVisibility);

    const jumpCondition = allConditions.find(
      (c) =>
        c.conditionValue.sourceQuestionId === currentQuestion.id &&
        c.actionType === 'JUMP',
    );

    const jumpToQuestion =
      jumpCondition &&
      this.matchCondition(
        currentQuestion.questionType,
        jumpCondition,
        responseDto,
      )
        ? allQuestions.find(
            (q) =>
              q.id === jumpCondition.jumpToQuestionId &&
              questionVisibility[q.id] &&
              !allResponses.some((r) => r.questionId === q.id),
          )
        : null;

    console.log('Jump Condition Found:', jumpCondition);

    const nextQuestion = await this.findNextQuestion({
      allQuestions,
      currentQuestion: jumpToQuestion ?? currentQuestion,
      visibility: questionVisibility,
      allResponses,
    });

    console.log('Final next question:', nextQuestion);

    if (!nextQuestion) {
      await this.responseService.updateCompleted(userResponse.id);
    }

    const surveyEnding =
      await this.surveyEndingRepository.getSurveyEndingBySurveyId(id);

    return {
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
            setting: nextQuestion.questionConfiguration?.settings || {},
          }
        : null,
      isLastQuestion: !nextQuestion,
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
  }

  async findNextQuestion({
    allQuestions,
    currentQuestion,
    visibility,
    allResponses,
  }) {
    console.log(currentQuestion, 'currentQuestion1231321');
    // Lọc danh sách câu hỏi có thể hiển thị và chưa được trả lời
    const unansweredQuestions = allQuestions.filter((q) => visibility[q.id]);
    // console.log('All Responses:', visibility);

    console.log('Unanswered Questions:', unansweredQuestions);

    // Nếu currentQuestion là câu nhảy tới và hợp lệ, sử dụng nó
    // if (
    //   currentQuestion &&
    //   unansweredQuestions.some((q) => q.id === currentQuestion.id)
    // ) {
    //   return currentQuestion;
    // }

    // Tìm index của câu hỏi hiện tại trong danh sách câu hỏi chung
    const currentIndex = allQuestions.findIndex(
      (q) => q.id === currentQuestion.id,
    );

    console.log(currentIndex, 'currentIndex');
    if (currentIndex === -1) return null; // Nếu không tìm thấy, không có câu tiếp theo

    // Duyệt tìm câu hỏi kế tiếp hợp lệ theo thứ tự
    for (let i = currentIndex + 1; i < allQuestions.length; i++) {
      const nextQ = allQuestions[i];
      if (
        visibility[nextQ.id]
        //  &&
        // !allResponses.some((r) => r.questionId === nextQ.id)
      ) {
        return nextQ; // Trả về câu hỏi tiếp theo hợp lệ
      }
    }

    return null; // Không tìm thấy câu tiếp theo
  }

  private async calculateQuestionVisibility(
    allQuestions: any[],
    allConditions: any[],
    allResponses: any[],
  ): Promise<Record<number, boolean>> {
    const visibility: Record<number, boolean> = Object.fromEntries(
      allQuestions.map((q) => [q.id, true]),
    );

    allConditions.forEach((condition) => {
      const sourceResponse = allResponses.find(
        (r) => r.questionId === condition.conditionValue.sourceQuestionId,
      );

      if (
        sourceResponse &&
        this.matchCondition(
          allQuestions.find((q) => q.id === condition.questionId).questionType,
          condition,
          sourceResponse,
        )
      ) {
        if (condition.actionType === 'HIDE')
          visibility[condition.questionId] = false;
        if (condition.actionType === 'SHOW')
          visibility[condition.questionId] = true;
      }
    });

    return visibility;
  }

  private matchCondition(
    questionType: string,
    conditionLogic: any,
    responseDto: any,
  ): boolean {
    if (!conditionLogic || !responseDto) return false;

    const { actionType, conditionValue } = conditionLogic;

    // Hàm xử lý điều kiện ẩn từ câu hỏi nguồn
    const matchSourceQuestion = (sourceAnswerOptionId: any) =>
      sourceAnswerOptionId
        ? responseDto.answerOptionId === sourceAnswerOptionId
        : false;

    // Danh sách xử lý theo loại câu hỏi
    const handlers: Record<string, () => boolean> = {
      SINGLE_CHOICE: () => {
        const responseAnswerOptions = Array.isArray(responseDto.answerOptionId)
          ? responseDto.answerOptionId
          : [responseDto.answerOptionId];

        if (matchSourceQuestion(conditionValue.answerOptionId)) return true;

        return actionType === 'EQUALS'
          ? responseAnswerOptions.includes(conditionValue.answerOptionId)
          : false;
      },

      MULTI_CHOICE: () => {
        if (!Array.isArray(responseDto.answerOptionId)) return false;
        if (matchSourceQuestion(conditionValue.answerOptionId)) return true;

        const conditionHandlers: Record<string, () => boolean> = {
          CONTAINS: () =>
            responseDto.answerOptionId.includes(conditionValue.answerOptionId),
          EQUALS: () =>
            responseDto.answerOptionId.length === 1 &&
            responseDto.answerOptionId[0] === conditionValue.answerOptionId,
          NOT_CONTAINS: () =>
            !responseDto.answerOptionId.includes(conditionValue.answerOptionId),
        };

        return (conditionHandlers[actionType] || (() => false))();
      },

      RATING_SCALE: () => {
        const rating = responseDto.ratingValue;
        if (matchSourceQuestion(conditionValue.answerOptionId)) return true;

        const conditionHandlers: Record<string, () => boolean> = {
          EQUALS: () => rating === conditionValue.value,
          GREATER_THAN: () => rating > conditionValue.value,
          LESS_THAN: () => rating < conditionValue.value,
          BETWEEN: () =>
            rating >= conditionValue.min && rating <= conditionValue.max,
        };

        return (conditionHandlers[actionType] || (() => false))();
      },

      INPUT_TEXT: () => {
        const text = responseDto.answer;
        if (matchSourceQuestion(conditionValue.answerOptionId)) return true;

        const conditionHandlers: Record<string, () => boolean> = {
          EQUALS: () => text === conditionValue.value,
          CONTAINS: () => text.includes(conditionValue.value),
        };

        return (conditionHandlers[actionType] || (() => false))();
      },
    };

    return (handlers[questionType] || (() => false))();
  }
  // Phương thức hỗ trợ để lấy toàn bộ dữ liệu khảo sát một lần
  async getSurveyData(id) {
    const surveyFeedback = await this.validateForm(id);
    if (!surveyFeedback) return null;

    const allQuestions = await this.questionSerivce.getAllQuestion(id);
    const ids = allQuestions.map((q) => q.id);
    const allConditions =
      await this.questionLogicService.findAllConditionsByQuestionIds(ids);

    return { surveyFeedback, allQuestions, allConditions };
  }
  async goBackToPreviousSurveyQuestion(
    id: number,
    currentQuestionId: number,
    request?: any,
    user?: number,
  ) {
    const userId = user;
    const sessionId = request?.headers?.['x-session-id'];

    const surveyData = await this.getSurveyData(id);
    if (!surveyData) throw new NotFoundException('Khảo sát không tồn tại');

    const { surveyFeedback, allQuestions, allConditions } = surveyData;

    const currentQuestion = surveyFeedback.questions.find(
      (q) => q.id === currentQuestionId,
    );
    if (!currentQuestion) {
      throw new NotFoundException(
        this.i18n.translate('errors.QUESTIONNOTFOUND'),
      );
    }

    const userResponses = await this.responseService.getPreviosResponse(
      id,
      userId,
      sessionId,
    );

    const responseHistory = userResponses.responseOnQuestions.sort(
      (a, b) => a.createdAt - b.createdAt,
    );

    const currentResponseIndex = responseHistory.findIndex(
      (response) => response.questionId === currentQuestionId,
    );

    let prevQuestion: any = null;
    let previousResponse: any = null;

    if (currentResponseIndex > 0) {
      for (let i = currentResponseIndex - 1; i >= 0; i--) {
        const response = responseHistory[i];
        const question = surveyFeedback.questions.find(
          (q) => q.id === response.questionId,
        );
        if (question) {
          prevQuestion = question;
          previousResponse = response;
          break;
        }
      }
    }

    const allResponses =
      await this.responseService.getAllResponsesByUserResponseId(
        userResponses.id,
      );

    if (!prevQuestion) {
      // Kiểm tra điều kiện nhảy
      const sourceCondition = allConditions.find(
        (cond) => cond.jumpToQuestionId === currentQuestionId,
      );

      if (sourceCondition) {
        prevQuestion = surveyFeedback.questions.find(
          (q) => q.id === sourceCondition.questionId,
        );
      }
    }

    if (!prevQuestion) {
      prevQuestion = await this.getPreviousQuestion(
        currentQuestionId,
        allQuestions,
        allConditions,
        allResponses,
      );
    }

    if (!prevQuestion) {
      throw new BadRequestException(
        this.i18n.translate('errors.NOPREVIOUSQUESTION'),
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
        answerOptions: prevQuestion.answerOptions?.map((ao) => ({
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
        setting: prevQuestion.questionConfiguration?.settings || {},
        previousAnswer: previousAnswer,
      },
      isLastQuestion: false,
      ending: null,
    };
  }

  async getPreviousQuestion(
    currentQuestionId: number,
    allQuestions: any[],
    allConditions: any[],
    allResponses: any[],
  ) {
    const currentQuestion =
      await this.questionSerivce.getQuestionById(currentQuestionId);
    if (!currentQuestion) {
      return null;
    }

    // Fix lỗi vòng lặp for
    for (let i = 0; i < allQuestions.length; i++) {
      console.log(allQuestions[i], `allQuestions[${i}]`);
    }

    const questionVisibility = await this.calculateQuestionVisibility(
      allQuestions,
      allConditions,
      allResponses,
    );
    console.log(questionVisibility, 'questionVisibility');

    const currentQuestionIndex = allQuestions.findIndex(
      (q) => q.id === currentQuestion.id,
    );

    let previousQuestion = null;
    for (let i = currentQuestionIndex - 1; i >= 0; i--) {
      if (questionVisibility[allQuestions[i].id]) {
        previousQuestion = allQuestions[i]; // Fix lỗi `await`
        break;
      }
    }

    return previousQuestion;
  }

  // Hàm phụ trợ để định dạng câu trả lời trước đó theo loại câu hỏi
  private formatPreviousAnswer(questionType: string, response: any) {
    switch (questionType) {
      case 'SINGLE_CHOICE':
        return { answerOptionId: response.answerOptionId };

      case 'MULTI_CHOICE':
        return {
          answerOptionId: Array.isArray(response.answerOptionId)
            ? response.answerOptionId
            : [response.answerOptionId],
        };

      case 'RATING_SCALE':
        return { ratingValue: response.ratingValue };

      case 'INPUT_TEXT':
        return { answer: response.answerText };

      case 'PICTURE_SELECTION':
        return { answerOptionId: response.answerOptionId };

      default:
        return null;
    }
  }

  async updateForm(id: number, updateFormDto: UpdatesurveyFeedbackDto) {
    return this.formRepository.updateSurveyFeedback(id, updateFormDto);
  }

  async deleteForm(id: number) {
    await this.formRepository.deleteSurveyFeedback(id);
    return { message: 'Survey deleted successfully' };
  }

  async updateStatus(status: FormStatus, formId: number, businessId: number) {
    const existingBusiness =
      await this.businessService.getbusinessbyId(businessId);
    if (!existingBusiness) {
      throw new NotFoundException(
        this.i18n.translate('errors.BUSINESSNOTFOUND'),
      );
    }

    await this.validateForm(formId);

    return this.formRepository.updateStatus(status, formId);
  }

  async updateSurveyAllowAnonymous(formId: number, active: boolean) {
    await this.validateForm(formId);
    return this.formRepository.updateSurveyAllowAnonymous(formId, active);
  }

  async updateFormSettings(
    formId: number,
    businessId: number | null,
    settings: UpdateSettingDto,
  ) {
    const form = await this.formRepository.getSurveyFeedbackById(formId);
    const allFormSettings =
      await this.surveyFeedbackSettingService.getAllSetting(formId);

    // const promises = settings.map((newSetting) => {
    //   const existingSetting = allFormSettings.find(
    //     (current) => current.key === newSetting.key,
    //   );
    //   if (
    //     existingSetting &&
    //     JSON.stringify(existingSetting.value) ===
    //       JSON.stringify(newSetting.value)
    //   ) {
    //     return null;
    //   }
    //   const formSetting = allFormSettings.find(
    //     (setting) => setting.key === newSetting.key,
    //   );
    //   if (!formSetting) {
    //     throw new Error(`FormSetting not found for key: ${newSetting.key}`);
    //   }
    // });
    const ids = allFormSettings.map((data) => {
      this.surveyFeedbackSettingService.updateSetting(data.id, settings);
    });
    return Promise.all(ids);
  }

  async getAllBusinessSettings(businessId: number, formId: number) {
    // const businessSettings =
    //   await this.surveyFeedbackSettingService.getAllSetting(businessId, formId);
    // // if (!businessSettings.length) {
    // //   return {
    // //     businessId,
    // //     formId,
    // //     settings: [],
    // //   };
    // // }
    // // // Nhóm cài đặt theo loại
    // // const groupedSettings = new Map<number, any>();
    // // for (const setting of businessSettings) {
    // //   const { formSetting } = setting;
    // //   if (!formSetting?.formSettingTypes) continue;
    // //   const { formSettingTypes } = formSetting;
    // //   const typeId = formSettingTypes.id;
    // //   if (!groupedSettings.has(typeId)) {
    // //     groupedSettings.set(typeId, {
    // //       id: typeId,
    // //       name: formSettingTypes.name,
    // //       description: formSettingTypes.description,
    // //       settings: [],
    // //     });
    // //   }
    // //   const group = groupedSettings.get(typeId);
    // //   const existingSettingIndex = group.settings.findIndex(
    // //     (s) => s.id === formSetting.id,
    // //   );
    // //   if (existingSettingIndex === -1) {
    // //     group.settings.push({
    // //       id: formSetting.id,
    // //       key: formSetting.key,
    // //       label: formSetting.label || formSetting.key,
    // //       description: formSetting.description,
    // //       businessSettings: [
    // //         {
    // //           key: setting.key,
    // //           value: setting.value,
    // //         },
    // //       ],
    // //     });
    // //   } else {
    // //     group.settings[existingSettingIndex].businessSettings.push({
    // //       key: setting.key,
    // //       value: setting.value,
    // //     });
    // //   }
    // // }
    // return {
    //   businessId,
    //   formId,
    //   // settings: Array.from(groupedSettings.values()),
    // };
  }

  async duplicateSurvey(id: number, businessId: number) {
    const formExisting = await this.formRepository.getSurveyFeedbackById(id);
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
    );

    const existingEnding =
      await this.surveyEndingRepository.getSurveyEndingBySurveyId(id);
    if (existingEnding) {
      await this.surveyEndingRepository.createSurveyEnding({
        formId: newForm.id,
        message: existingEnding.message,
        redirectUrl: existingEnding.redirectUrl,
        mediaId: existingEnding.mediaId,
      });
    }

    await this.duplicateQuestions(
      formExisting.id,
      newForm.id,
      formExisting.businessId,
    );
    await this.duplicateSurveySettings(
      formExisting.id,
      newForm.id,
      formExisting.businessId,
    );

    return newForm;
  }

  private async duplicateQuestions(
    originalFormId: number,
    newFormId: number,
    businessId: number,
  ) {
    const questions = await this.questionSerivce.getAllQuestion(originalFormId);

    await Promise.all(
      questions.map(async (question) => {
        const addQuestionDto: AddQuestionDto = {
          headline: question.headline,
          questionType: question.questionType,
        };

        const newQuestion = await this.questionSerivce.createQuestion(
          newFormId,
          addQuestionDto,
          question.index,
        );

        const promises: Promise<any>[] = [];

        if (question.questionOnMedia) {
          promises.push(
            this.duplicateQuestionMedia(question.id, newQuestion.id),
          );
        }

        if (question.answerOptions.length > 0) {
          promises.push(
            this.duplicateAnswerOptions(
              question.id,
              newQuestion.id,
              businessId,
            ),
          );
        }

        // if (question.questionConfiguration) {
        //   promises.push(
        //     this.questionSerivce.createQuestionSettings(
        //       newQuestion.id,
        //       question.questionConfiguration.settings,
        //       question.questionConfiguration.key,
        //       newFormId,
        //     ),
        //   );
        // }

        await Promise.all(promises);
      }),
    );
  }

  private async duplicateAnswerOptions(
    originalQuestionId: number,
    newQuestionId: number,
    businessId: number,
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
          );

        if (option.answerOptionOnMedia) {
          const media = await this.mediaService.getMediaById(
            option.answerOptionOnMedia.mediaId,
          );
          if (media) {
            await this.answerOptionMediaService.createAnswerOptionOnMedia([
              { mediaId: media.id, answerOptionId: newAnswerOption.id },
            ]);
          }
        }
        return newAnswerOption;
      }),
    );
  }

  private async duplicateQuestionMedia(
    originalQuestionId: number,
    newQuestionId: number,
  ) {
    const media =
      await this.questionMediaService.getQuestionOnMediaByQuestionId(
        originalQuestionId,
      );
    if (media) {
      await this.questionMediaService.createQuestionOnMedia({
        mediaId: media.mediaId,
        questionId: newQuestionId,
      });
    }
  }

  private async duplicateSurveySettings(
    originalFormId: number,
    newFormId: number,
    businessId: number,
  ) {
    const surveySettings =
      await this.surveyFeedbackSettingService.getAllSetting(originalFormId);
    // if (surveySettings.length > 0) {
    //   await Promise.all(
    //     surveySettings.map((setting) =>
    //       this.surveyFeedbackSettingService.(
    //         newFormId,
    //         businessId,
    //         setting.key,
    //         setting.value,
    //         setting.formSettingId,
    //       ),
    //     ),
    //   );
    // }
  }

  async updateSurveyEnding(surveyId: number, ending: UpdateFormEndingDto) {
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
      message: ending.endingMessage,
      redirectUrl: ending.endingRedirectUrl,
    });
  }

  private validateFormRequet(form: UpdatesurveyFeedbackDto): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate name (required)
    if (!form.name || form.name.trim() === '') {
      errors.push(this.i18n.translate('errors.MISSING_FORM_NAME'));
    }

    // Validate status (required and must be valid)
    if (!form.status) {
      errors.push(this.i18n.translate('errors.MISSING_FORM_STATUS'));
    } else {
      const validStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
      if (!validStatuses.includes(form.status)) {
        errors.push(
          this.i18n.translate('errors.INVALID_FORM_STATUS', {
            args: { status: form.status },
          }),
        );
      }
    }

    if (!form.ending) {
      errors.push(this.i18n.translate('errors.EMPTY_ENDING_MESSAGE'));
    }

    return { isValid: errors.length === 0, errors };
  }

  async saveForm(
    formId: number,
    updateFormDto: UpdatesurveyFeedbackDto,
    updateQuestionDto: UpdateQuestionDto[],
  ) {
    console.time('Execution Time');
    const form = await this.formRepository.getSurveyFeedbackById(formId);
    if (!form) {
      throw new NotFoundException(
        this.i18n.translate('errors.SURVEYIDNOTEXISTING'),
      );
    }

    const validationResult =
      await this.questionSerivce.validateQuestions(updateQuestionDto);
    if (!validationResult.isValid) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validationResult.errors,
      });
    }

    await this.formRepository.updateSurveyFeedback(formId, updateFormDto);
    const questions = await this.questionSerivce.addAndUpdateQuestions(
      form.id,
      updateQuestionDto,
    );

    console.timeEnd('Execution Time');

    return {
      message: this.i18n.translate('errors.FORM_SAVED_SUCCESSFULLY'),
    };
  }
}
