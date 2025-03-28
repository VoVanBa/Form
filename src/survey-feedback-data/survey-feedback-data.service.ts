import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FormResponse } from 'src/response-customization/user-responses.response';
import { ResponseDto } from './dtos/response.dto';
import { QuestionSetting } from './dtos/question.setting.dto';
import { CreateResponseOnQuestionDto } from './dtos/create.response.on.question.dto';
import { FormSettingDto } from './dtos/form.setting.dto';
import { PrismaUserResponseRepository } from 'src/repositories/prisma-user-response.repository';
import { PrismaResponseQuestionRepository } from 'src/repositories/prisma-response-question.repository';
import { I18nService } from 'nestjs-i18n';
import { QuestionType } from 'src/question/entities/enums/QuestionType';
import { FormStatus } from 'src/surveyfeedback-form/entities/enums/FormStatus';
import { QuestionService } from 'src/question/service/question.service';
import { JsonHelper } from 'src/helper/json-helper';
import { SurveyFeedackFormService } from 'src/surveyfeedback-form/surveyfeedback-form.service';
import { SurveyFeedbackSettingService } from 'src/settings/service/survey-feedback-setting.service';
import { QuestionConfigurationService } from 'src/settings/service/question-configuaration.service';
import { QuestionSettingInterface } from 'src/settings/dtos/questionSettingInterface';

@Injectable()
export class SurveyFeedbackDataService {
  constructor(
    @Inject(forwardRef(() => SurveyFeedackFormService))
    private formService: SurveyFeedackFormService,
    private userResponseRepository: PrismaUserResponseRepository,
    private responseQuestionRepository: PrismaResponseQuestionRepository,
    @Inject(forwardRef(() => QuestionService))
    private questionService: QuestionService,
    private formSetting: SurveyFeedbackSettingService,
    private questionSetting: QuestionConfigurationService,
    private i18n: I18nService,
  ) {}

  async getStatusAnonymous(formId: number) {
    const form = await this.formService.validateForm(formId);

    return form.allowAnonymous;
  }

  async saveFeedBackResponse(
    businessId: number,
    formId: number,
    createResponse: CreateResponseOnQuestionDto,
    userId?: number,
  ) {
    const { guestData, responses } = createResponse;
    const existingForm = await this.formService.validateForm(formId);
    if (!existingForm) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEY_FEEDBACK_NOT_FOUND'),
      );
    }

    if (
      existingForm.status === FormStatus.DRAFT ||
      existingForm.status === FormStatus.COMPLETED
    ) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEY_NOT_AVAILABLE'),
      );
    }

    const settings = await this.formSetting.getAllSetting(formId);

    const validationFormErrors = await this.formSetting.validateFormSetting(
      formId,
      settings,
    );

    const rawQuestionSettings =
      await this.questionSetting.getAllQuestionSettings(formId);

    const questionSettings = rawQuestionSettings.map((setting) => {
      let parsedSettings: QuestionSettingInterface;

      if (typeof setting.settings === 'string') {
        parsedSettings =
          JsonHelper.parse<QuestionSettingInterface>(setting.settings) || {};
      } else {
        parsedSettings = setting.settings as QuestionSettingInterface;
      }

      return {
        id: setting.id,
        questionId: setting.questionId,
        formId: setting.formId,
        key: setting.key,
        settings: parsedSettings,
      } as QuestionSetting;
    });

    const validationErrors =
      await this.questionSetting.validateResponsesByQuestionSettings(
        responses,
        questionSettings,
      );

    const userSurveyResponse = await this.userResponseRepository.create(
      formId,
      guestData,
      userId,
    );

    const responsePromises = responses.map(async (response) => {
      const { questionId, answerOptionId, answerText, ratingValue } = response;

      if (Array.isArray(answerOptionId)) {
        return Promise.all(
          answerOptionId.map((optionId) =>
            this.responseQuestionRepository.create(
              questionId,
              optionId,
              userSurveyResponse.id,
              answerText,
              ratingValue,
              formId,
            ),
          ),
        );
      } else {
        return this.responseQuestionRepository.create(
          questionId,
          answerOptionId,
          userSurveyResponse.id,
          answerText,
          ratingValue,
          formId,
        );
      }
    });

    await Promise.all(responsePromises);

    const ending = await this.formService.getSurveyEndingBySurveyId(formId);

    return { ending };
  }

  async updateCompleted(id: number) {
    return await this.userResponseRepository.update(id);
  }

  async totalResponses(formId: number): Promise<number> {
    return await this.responseQuestionRepository.totalResponses(formId);
  }

  async getFormRate(
    formId: number,
    option?: string,
    customStartDate?: string,
    customEndDate?: string,
  ) {
    const totalResponses =
      await this.responseQuestionRepository.totalResponses(formId);
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (option) {
      const dateRange = this.getDateRange(
        option,
        customStartDate,
        customEndDate,
      );
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    }

    const questions = await this.questionService.getAllQuestion(
      formId,
      startDate,
      endDate,
    );
    const detailedResponses = questions.map((question) => {
      const responses = [];
      let totalQuestionResponses = 0;
      let media = null;
      let other = null;
      if (question.questionOnMedia) {
        media = question.questionOnMedia[0]?.media.url;
      }
      if (
        question.questionType === QuestionType.SINGLE_CHOICE.toString() ||
        question.questionType === QuestionType.MULTI_CHOICE.toString() ||
        question.questionType === QuestionType.PICTURE_SELECTION.toString()
      ) {
        const totalQuestion = question.responseOnQuestions.length;

        question.answerOptions.forEach((option) => {
          const count = question.responseOnQuestions.filter(
            (response) => response.answerOptionId === option.id,
          ).length;

          const percentage =
            count === 0 ? 0 : ((count / totalQuestion) * 100).toFixed(2);

          const responseObj: any = {
            id: option.id,
            label: option.label,
            count,
            percentage,
          };

          if (
            question.questionType === QuestionType.PICTURE_SELECTION.toString()
          ) {
            if (option.answerOptionOnMedia) {
              responseObj.media = option.answerOptionOnMedia.media.url;
            }
          }

          responses.push(responseObj);
        });

        other = question.responseOnQuestions
          .map((data) => data.otherAnswer)
          .filter((answer) => answer && answer.trim() !== ''); // Loại bỏ null, undefined, hoặc chuỗi rỗng

        if (other.length > 0) {
          const otherCount = other.length;
          const otherPercentage =
            otherCount === 0
              ? 0
              : ((otherCount / totalQuestion) * 100).toFixed(2);

          responses.push({
            label: 'Other',
            count: otherCount,
            percentage: otherPercentage,
            otherAnswer: other,
          });
        } else {
          responses.push({
            label: 'Other',
            count: 0,
            percentage: 0,
            otherAnswer: [],
          });
        }
        totalQuestionResponses = totalQuestion;
      } else if (
        question.questionType === QuestionType.RATING_SCALE.toString()
      ) {
        const configurations = question.questionConfiguration;

        const range = JsonHelper.getSettingValue(configurations, 'range', 0);

        const ratingCounts = Array(range).fill(0);

        question.responseOnQuestions.forEach((response) => {
          if (
            response.ratingValue &&
            response.ratingValue >= 1 &&
            response.ratingValue <= range
          ) {
            ratingCounts[response.ratingValue - 1]++;
            totalQuestionResponses++;
          }
        });

        for (let i = 0; i < range; i++) {
          const percentage =
            ratingCounts[i] === 0
              ? 0
              : ((ratingCounts[i] / totalQuestionResponses) * 100).toFixed(2);

          responses.push({
            label: `${i + 1}`,
            count: ratingCounts[i],
            percentage: percentage,
          });
        }
      } else if (question.questionType === QuestionType.INPUT_TEXT.toString()) {
        const texts = question.responseOnQuestions
          .filter((response) => response.answerText)
          .map((response) => response.answerText);

        responses.push(...texts.map((text) => ({ answerText: text })));
        totalQuestionResponses = responses.length;
      }

      return {
        questionId: question.id,
        type: question.questionType,
        headline: question.headline,
        media,
        responses,
        totalQuestionResponses,
      };
    });

    return {
      totalResponses,
      questions: detailedResponses,
    };
  }

  async getUserResponse(formId: number) {
    const form = await this.formService.validateForm(formId);

    const surveyResponseQuestions =
      await this.userResponseRepository.getUserResponse(formId);

    return surveyResponseQuestions;
  }

  async getUserResponseDetails(
    formId: number,
    option?: string,
    customStartDate?: string,
    customEndDate?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    // Chuyển kiểu trả về sang `Promise<any>` nếu không dùng class DTO
    const existingForm = await this.formService.validateForm(formId);

    let startDate: Date | undefined;
    let endDate: Date | undefined;
    if (option) {
      const dateRange = this.getDateRange(
        option,
        customStartDate,
        customEndDate,
      );
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    }

    const userResponsesPage =
      await this.userResponseRepository.getAllUserResponses(
        formId,
        startDate,
        endDate,
        page,
        limit,
      );

    const formattedData = userResponsesPage.data.map((userResponse) => ({
      id: userResponse.id,
      sentAt: userResponse.sentAt,
      isAnonymous: !userResponse.userId ? true : false,
      person:
        userResponse.userId !== null && userResponse.user
          ? {
              name: userResponse.user.username || null,
              email: userResponse.user.email || null,
            }
          : null,
      guest: userResponse.guest
        ? JsonHelper.mapGuestData(userResponse.guest)
        : null,
      severityScores: this.calculateSeverity(userResponse),
      completed: userResponse.completedAt,
      responses: userResponse.responseOnQuestions.map((response) => {
        let answer: any = null;

        if (response.answerOptionId === null && response.otherAnswer) {
          answer = response.otherAnswer;
        }
        if (
          response.answerOptionId &&
          response.question.answerOptions.length > 0
        ) {
          const answerQuestion =
            response.question.answerOptions.find(
              (opt) => opt.id === response.answerOptionId,
            )?.answerOptionOnMedia?.media?.url ??
            response.question.answerOptions.find(
              (opt) => opt.id === response.answerOptionId,
            )?.label ??
            null;

          answer = answerQuestion;
        } else if (response.question.questionType === 'INPUT_TEXT') {
          answer = response.answerText ?? null;
        } else if (response.question.questionType === 'RATING_SCALE') {
          answer = response.ratingValue ?? null;
        }

        return {
          headline: response.question.headline,
          questionType: response.question.questionType,
          answer,
        };
      }),
    }));

    return {
      formId,
      data: formattedData,
      meta: userResponsesPage.meta,
    };
  }

  async getUserResponseDetailById(
    formId: number,
    responseId: number,
  ): Promise<any> {
    const existingForm = await this.formService.validateForm(formId);

    const userResponsesPage =
      await this.userResponseRepository.getAllUserResponses(formId);

    const userResponses = userResponsesPage.data.filter(
      (reponse) => reponse.id == responseId,
    );
    const formattedData = userResponses.map((userResponse) => ({
      id: userResponse.id,
      sentAt: userResponse.sentAt,
      isAnonymous: !userResponse.userId ? true : false,
      person:
        userResponse.userId !== null && userResponse.user
          ? {
              name: userResponse.user.username || null,
              email: userResponse.user.email || null,
            }
          : null,
      guest: userResponse.guest
        ? JsonHelper.mapGuestData(userResponse.guest)
        : null,
      severityScores: this.calculateSeverity(userResponse),
      completed: userResponse.completedAt,
      responses: userResponse.responseOnQuestions.map((response) => {
        let answer: any = null;

        if (response.answerOptionId === null && response.otherAnswer) {
          answer = response.otherAnswer;
        }
        if (
          response.answerOptionId &&
          response.question.answerOptions.length > 0
        ) {
          const answerQuestion =
            response.question.answerOptions.find(
              (opt) => opt.id === response.answerOptionId,
            )?.answerOptionOnMedia?.media?.url ??
            response.question.answerOptions.find(
              (opt) => opt.id === response.answerOptionId,
            )?.label ??
            null;

          answer = answerQuestion;
        } else if (response.question.questionType === 'INPUT_TEXT') {
          answer = response.answerText ?? null;
        } else if (response.question.questionType === 'RATING_SCALE') {
          answer = response.ratingValue ?? null;
        }

        return {
          headline: response.question.headline,
          questionType: response.question.questionType,
          answer,
        };
      }),
    }));

    return {
      formId,
      data: formattedData,
    };
  }

  async getDetailResponsesByUsername(username: string, formId: number) {
    const existingForm = await this.formService.validateForm(formId);

    const userResponses =
      await this.userResponseRepository.getDetailResponsesByUsername(
        username,
        formId,
      );

    const formattedData = userResponses.map((userResponse) => ({
      sentAt: userResponse.sentAt,
      user:
        userResponse.userId !== null && userResponse.user
          ? {
              name: userResponse.user.username || null,
              email: userResponse.user.email || null,
            }
          : null,
      guest:
        userResponse.guest && typeof userResponse.guest === 'object'
          ? JsonHelper.mapGuestData(userResponse.guest)
          : null,
      responseOnQuestions: userResponse.responseOnQuestions.map((response) => ({
        questionId: response.question.id,
        headline: response.question.headline,
        questionType: response.question.questionType,
        answerText: response.answerText,
        ratingValue: response.ratingValue,
        answerOptions: response.question.answerOptions
          .filter((option) => option.id === response.answerOptionId)
          .map((option) => ({
            answerOptionId: option.id,
            label: option.label,
            media: option.answerOptionOnMedia?.media?.url,
          })),
      })),
    }));

    return plainToInstance(
      FormResponse,
      { formId, userResponses: formattedData },
      { excludeExtraneousValues: true },
    );
  }
  async filterResponsesByOption(
    formId: number,
    option: string,
    page: number,
    pageSize: number,
  ) {
    const form = await this.formService.validateForm(formId);

    const { startDate, endDate } = this.getDateRange(option);

    console.log(startDate, endDate, 'startDate, endDate');

    const skip = (page - 1) * pageSize;
    const take = pageSize;
    return this.userResponseRepository.filterResponsesByDateRange(
      form.id,
      startDate,
      endDate,
      skip,
      take,
    );
  }

  private getDateRange(
    option: string,
    customStartDate?: string,
    customEndDate?: string,
  ): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (option) {
      case 'Last 7 days':
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
        break;
      case 'Last 30 days':
        startDate = new Date();
        startDate.setDate(now.getDate() - 30);
        break;
      case 'This month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'Last month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'This quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        break;
      case 'Last quarter':
        const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
        const lastQuarterStartMonth = lastQuarter * 3;
        startDate = new Date(now.getFullYear(), lastQuarterStartMonth, 1);
        endDate = new Date(now.getFullYear(), lastQuarterStartMonth + 3, 0);
        break;
      case 'Last 6 months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case 'This year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'Last year':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      case 'All time':
        startDate = new Date(0);
        break;
      case 'Custom':
        if (!customStartDate || !customEndDate) {
          throw new Error(
            'Custom date range requires both startDate and endDate',
          );
        }
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        break;
      default:
        throw new Error(`Invalid date range option: ${option}`);
    }

    return { startDate, endDate };
  }

  private calculateSeverity(form: any): string {
    const negativeWords = ['tệ', 'không hài lòng', 'kém', 'tồi tệ', 'quá tệ'];
    const severityScores: number[] = [];

    for (const response of form.responseOnQuestions) {
      let score = 1; // Mặc định là "low"

      console.log(response, 'response');
      if (
        response.question.questionType === 'RATING_SCALE' &&
        response.ratingValue
      ) {
        if (response.ratingValue <= 2) score = 3;
        else if (response.answer === 3) score = 2; // Medium severity
      }

      if (
        response.question.questionType === 'INPUT_TEXT' &&
        response.answerText
      ) {
        const answerText = response.answerText.toLowerCase().trim();
        if (negativeWords.some((word) => answerText.includes(word))) {
          score = 3;
        }
      }

      severityScores.push(score);
    }

    if (severityScores.length === 0) return 'low';
    const avgSeverity =
      severityScores.reduce((a, b) => a + b, 0) / severityScores.length;

    console.log(avgSeverity, 'avgSeverity');
    // Quy đổi điểm trung bình về mức độ nghiêm trọng
    if (avgSeverity >= 2.5) return 'high';
    if (avgSeverity >= 1.5) return 'medium';

    console.log(avgSeverity, 'avgSeverity');
    return 'low';
  }

  async createResponse(
    formId: number,
    questionId: number,
    responseData: ResponseDto,
    userId?: number,
    sessionId?: string,
  ) {
    // Find or create UserOnResponse
    let userResponse;
    if (userId) {
      userResponse = await this.userResponseRepository.getUserResponseByUserId(
        userId,
        formId,
      );
    }
    if (sessionId) {
      userResponse =
        await this.userResponseRepository.getUserResponseBySessionId(
          sessionId,
          formId,
        );
    }

    const question = await this.questionService.getQuestionById(questionId);

    // If not found, create a new UserOnResponse
    if (!userResponse) {
      const guestData = !userId && sessionId ? { sessionId } : null;
      userResponse = await this.userResponseRepository.createUserOnResponse(
        formId,
        userId || null,
        guestData,
      );
    }

    const questionResponse =
      await this.responseQuestionRepository.getResponseByUserResponseId(
        userResponse.id,
        questionId,
      );

    if (questionResponse) {
      await this.userResponseRepository.deleteExistingResponses(
        questionResponse.id,
        questionId,
        formId,
      );
    }

    if (
      (!responseData.answerOptionId &&
        !responseData.answerText &&
        !responseData.ratingValue &&
        !responseData.otherAnswer) ||
      (Array.isArray(responseData.answerOptionId) &&
        responseData.answerOptionId.length === 0)
    ) {
      await this.userResponseRepository.createResponseSkiped(
        userResponse.id,
        questionId,
        formId,
        true,
      );
      return userResponse;
    }

    // Create answer data based on question type
    switch (question.questionType) {
      case 'SINGLE_CHOICE':
        if (typeof responseData.answerOptionId === 'number') {
          await this.userResponseRepository.createSingleChoiceResponse(
            userResponse.id,
            questionId,
            formId,
            responseData.answerOptionId,
          );
        } else if (responseData.otherAnswer) {
          await this.userResponseRepository.createOtherAnwserResponse(
            userResponse.id,
            questionId,
            formId,
            responseData.otherAnswer,
          );
        }
        break;

      case 'MULTI_CHOICE':
      case 'PICTURE_SELECTION':
        if (Array.isArray(responseData.answerOptionId)) {
          await Promise.all(
            responseData.answerOptionId.map((optionId) =>
              this.userResponseRepository.createMultiChoiceResponse(
                userResponse.id,
                questionId,
                formId,
                optionId,
              ),
            ),
          );
        } else if (responseData.otherAnswer) {
          await this.userResponseRepository.createOtherAnwserResponse(
            userResponse.id,
            questionId,
            formId,
            responseData.otherAnswer,
          );
        }
        break;

      case 'INPUT_TEXT':
        if (responseData.answerText) {
          await this.userResponseRepository.createTextResponse(
            userResponse.id,
            questionId,
            formId,
            responseData.answerText,
          );
        }
        break;

      case 'RATING_SCALE':
        if (typeof responseData.ratingValue === 'number') {
          await this.userResponseRepository.createRatingResponse(
            userResponse.id,
            questionId,
            formId,
            responseData.ratingValue,
          );
        }
        break;

      default:
        throw new BadRequestException(
          `Unsupported question type: ${question.questionType}`,
        );
    }

    return userResponse;
  }

  // async removeResponseForQuestion(
  //   surveyId: number,
  //   questionId: number,
  //   userId?: number,
  //   sessionId?: string,
  // ): Promise<void> {
  //   // Xác định điều kiện tìm kiếm dựa trên user hoặc session
  //   const whereCondition: any = {
  //     formId: surveyId,
  //     questionId: questionId,
  //   };

  //   if (userId) {
  //     whereCondition.useronResponseId = {
  //       userId: userId,
  //     };
  //   } else if (sessionId) {
  //     // Lấy userOnResponseId từ sessionId
  //     const userResponse = await this.prisma.userOnResponse.findFirst({
  //       where: {
  //         formId: surveyId,
  //         guest: {
  //           path: ['sessionId'],
  //           equals: sessionId,
  //         },
  //       },
  //       select: {
  //         id: true,
  //       },
  //     });

  //     if (userResponse) {
  //       whereCondition.useronResponseId = userResponse.id;
  //     } else {
  //       return; // Không tìm thấy response để xóa
  //     }
  //   }

  //   // Xóa response
  //   await this.prisma.responseOnQuestion.deleteMany({
  //     where: whereCondition,
  //   });
  // }

  async getPreviosResponse(
    formId: number,
    userId?: number | null,
    sessionId?: string,
  ) {
    let userResponse;
    if (userId) {
      userResponse = await this.userResponseRepository.getUserResponseByUserId(
        userId,
        formId,
      );
    }
    if (sessionId) {
      userResponse =
        await this.userResponseRepository.getUserResponseBySessionId(
          sessionId,
          formId,
        );
    }

    return userResponse;
  }

  async removeResponseForQuestion(
    formId: number,
    questionId: number,
    userResponseId: number,
  ) {
    return this.userResponseRepository.deleteExistingResponses(
      formId,
      questionId,
      userResponseId,
    );
  }

  async getResponseByUserResponseIdAndQuestionId(
    userResponseId: number,
    questionId: number,
  ) {
    return this.responseQuestionRepository.getResponseByUserResponseIdAndQuestionId(
      userResponseId,
      questionId,
    );
  }
  async getAllResponsesByUserResponseId(userResponseId: number) {
    return this.responseQuestionRepository.getAllResponseByUserResponseId(
      userResponseId,
    );
  }
}
