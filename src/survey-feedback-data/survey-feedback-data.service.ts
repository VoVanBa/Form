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
import { PrismaFormSettingRepository } from 'src/repositories/prisma-setting.repository';
import { I18nService } from 'nestjs-i18n';
import ConfigManager from 'src/config/configJsonManager';
import { QuestionType } from 'src/models/enums/QuestionType';
import { FormStatus } from 'src/models/enums/FormStatus';
import { PrismaSurveyFeedbackRepository } from 'src/repositories/prisma-survey-feeback.repository';
import { QuestionService } from 'src/question/question.service';

@Injectable()
export class SurveyFeedbackDataService {
  constructor(
    private formRepository: PrismaSurveyFeedbackRepository,
    private userResponseRepository: PrismaUserResponseRepository,
    private responseQuestionRepository: PrismaResponseQuestionRepository,
    @Inject(forwardRef(() => QuestionService))
    private questionService: QuestionService,
    private formSetting: PrismaFormSettingRepository,
    private i18n: I18nService,
    private configManager: ConfigManager,
  ) {}

  async getStatusAnonymous(formId: number) {
    const form = await this.formRepository.getSurveyFeedbackById(formId);
    if (!form) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }
    return form.allowAnonymous;
  }

  async saveGuestInfoAndResponses(
    businessId: number,
    formId: number,
    createResponse: CreateResponseOnQuestionDto,
    userId?: number,
    request?: any,
  ) {
    const { guestData, responses } = createResponse;
    const tx = request?.transaction;
    const existingForm = await this.formRepository.getSurveyFeedbackById(
      formId,
      tx,
    );
    if (!existingForm) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }
    if (
      existingForm.status === FormStatus.DRAFT ||
      existingForm.status === FormStatus.COMPLETED
    ) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYNOTAVAILABLE'),
      );
    }

    const settings = await this.formSetting.getAllFormSettingBusiness(
      businessId,
      formId,
      tx,
    );
    const transformedSettings = this.configManager.transformSettings(settings);

    const validationFormErrors = await this.validateResponseOptions(
      formId,
      transformedSettings,
    );

    const questionSettings =
      await this.questionService.getQuestionSettingByFormId(formId);

    console.log(questionSettings, 'quest123456ionSettings');

    const validationErrors = await this.validateQuestionResponses(
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
              tx,
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
          tx,
        );
      }
    });

    await Promise.all(responsePromises);

    const successMessage = this.i18n.translate(
      'messages.RESPONSES_SAVED_SUCCESSFULLY',
    );

    return { message: successMessage };
  }

  async validateResponseOptions(
    formId: number,
    responseOptions: FormSettingDto[],
  ) {
    const currentDate = new Date();
    const totalResponses =
      await this.responseQuestionRepository.totalResponses(formId);

    for (const formSetting of responseOptions) {
      const { enabled, limit, date } = formSetting.settings;

      if (!enabled) continue;

      if (
        formSetting.key === 'closeOnResponseLimit' &&
        totalResponses >= limit
      ) {
        throw new BadRequestException({
          message: this.i18n.translate('errors.RESPONSELIMITEXCEEDED', {
            args: { key: formSetting.key },
          }),
          key: formSetting.key,
        });
      }

      if (formSetting.key === 'releaseOnDate') {
        if (!date) {
          throw new BadRequestException({
            message: this.i18n.translate('errors.RELEASEONDATEWITHOUTDATE', {
              args: { key: formSetting.key },
            }),
            key: formSetting.key,
          });
        }

        const releaseDate = new Date(date);
        if (releaseDate > currentDate) {
          throw new BadRequestException({
            message: this.i18n.translate('errors.SURVEYNOTYETRELEASED', {
              args: { date, key: formSetting.key },
            }),
            key: formSetting.key,
          });
        }
      }

      if (formSetting.key === 'closeOnDate') {
        if (!date) {
          throw new BadRequestException({
            message: this.i18n.translate('errors.CLOSEONDATEWITHOUTDATE', {
              args: { key: formSetting.key },
            }),
            key: formSetting.key,
          });
        }

        const closeDate = new Date(date);
        if (closeDate <= currentDate) {
          throw new BadRequestException({
            message: this.i18n.translate('errors.SURVEYCLOSED', {
              args: { date, key: formSetting.key },
            }),
            key: formSetting.key,
          });
        }
      }
    }
  }

  async validateQuestionResponses(
    responses: ResponseDto | ResponseDto[], // Hỗ trợ cả object và array
    settings: QuestionSetting[] | QuestionSetting,
  ) {
    if (Array.isArray(responses)) {
      for (const response of responses) {
        await this.validateSingleResponse(response, settings);
      }
    } else {
      await this.validateSingleResponse(responses, settings);
    }
  }

  private async validateSingleResponse(
    response: ResponseDto,
    settings: QuestionSetting[] | QuestionSetting,
  ) {
    const type = await this.questionService.getQuestionById(
      response.questionId,
    );

    let questionSetting: QuestionSetting | undefined;

    if (Array.isArray(settings)) {
      // Nếu settings là mảng, tìm theo key
      questionSetting = settings.find(
        (setting) => setting.key === type.questionType,
      );
    } else {
      // Nếu settings không phải mảng, lấy luôn giá trị
      questionSetting = settings;
    }

    if (!questionSetting) {
      throw new BadRequestException(
        this.i18n.translate('errors.QUESTIONREQUIRESSELECTION', {
          args: { questionId: response.questionId },
        }),
      );
    }

    const isRequired = questionSetting.settings.required === true;

    if (isRequired && this.isEmptyResponse(response)) {
      throw new BadRequestException(
        this.i18n.translate('errors.QUESTIONREQUIRESSELECTION', {
          args: { questionId: response.questionId },
        }),
      );
    }

    // Xử lý logic theo từng loại câu hỏi
    this.validateResponseByType(type.questionType, response, questionSetting);
  }

  private validateResponseByType(
    questionType: string,
    response: ResponseDto,
    questionSettings: any,
  ) {
    switch (questionType) {
      case 'SINGLE_CHOICE':
      case 'PICTURE_SELECTION':
        if (
          (questionSettings.required && !response.answerOptionId) ||
          !response.answerOptionId
        ) {
          throw new BadRequestException(
            this.i18n.translate('errors.QUESTIONREQUIRESSELECTION', {
              args: { questionId: response.questionId },
            }),
          );
        }
        if (
          Array.isArray(response.answerOptionId) &&
          response.answerOptionId.length > questionSettings.maxSelections
        ) {
          throw new BadRequestException(
            this.i18n.translate('errors.QUESTIONREQUIRESSELECTION', {
              args: { questionId: response.questionId },
            }),
          );
        }
        break;

      case 'MULTI_CHOICE':
        if (response.answerOptionId) {
          if (
            response.answerOptionId.length <
            (questionSettings.minSelections || 1 || !response.answerOptionId)
          ) {
            throw new BadRequestException(
              this.i18n.translate('errors.QUESTIONREQUIRESSELECTION', {
                args: { questionId: response.questionId },
              }),
            );
          }
          if (
            response.answerOptionId.length >
            (questionSettings.maxSelections || Infinity)
          ) {
            throw new BadRequestException(
              `Question ID ${response.questionId} allows a maximum of ${questionSettings.maxSelections} selections.`,
            );
          }
        } else if (questionSettings.required) {
          throw new BadRequestException(
            this.i18n.translate('errors.QUESTIONREQUIRESSELECTION', {
              args: { questionId: response.questionId },
            }),
          );
        }
        break;

      case 'INPUT_TEXT':
        if (questionSettings.required && !response.answerText) {
          throw new BadRequestException(
            this.i18n.translate('errors.QUESTIONREQUIRESINPUTTEXT', {
              args: { questionId: response.questionId },
            }),
          );
        }
        break;

      case 'RATING_SCALE':
        if (questionSettings.required && response.ratingValue === undefined) {
          throw new BadRequestException(
            this.i18n.translate('errors.QUESTIONREQUIRESRATINGVALUE', {
              args: { questionId: response.questionId },
            }),
          );
        }

        if (
          response.ratingValue !== undefined &&
          (response.ratingValue > parseFloat(questionSettings.settings.range) ||
            response.ratingValue <= 0)
        ) {
          throw new BadRequestException(
            this.i18n.translate('errors.INVALIDRATINGVALUE', {
              args: { questionId: response.questionId },
            }),
          );
        }
        break;

      default:
        throw new BadRequestException(
          `Unknown question type for question ID ${response.questionId}.`,
        );
    }
  }

  private isEmptyResponse(response: ResponseDto): boolean {
    return (
      response.answerText == null &&
      response.answerOptionId == null &&
      response.ratingValue == null
    );
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

    const questions = await this.responseQuestionRepository.getAll(
      formId,
      startDate,
      endDate,
    );
    const detailedResponses = questions.map((question) => {
      const responses = [];
      let totalQuestionResponses = 0;
      let media = null;
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
            percentage: percentage,
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
        totalQuestionResponses = totalQuestion;
      } else if (
        question.questionType === QuestionType.RATING_SCALE.toString()
      ) {
        const configurations = question.businessQuestionConfiguration;

        const range = this.configManager.getSettingValue(
          configurations,
          'range',
          0,
        );

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
    const form = await this.formRepository.getSurveyFeedbackById(formId);

    if (!form) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }

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
  ): Promise<FormResponse> {
    const existingForm =
      await this.formRepository.getSurveyFeedbackById(formId);
    if (!existingForm) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }

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
      console.log(startDate, endDate, 'startDate, endDate');
    }

    const userResponsesPage =
      await this.userResponseRepository.getUserResponses(
        formId,
        startDate,
        endDate,
        page,
        limit,
      );

    const formattedData = userResponsesPage.data.map((userResponse) => ({
      sentAt: userResponse.sentAt,
      user:
        userResponse.userId !== null && userResponse.user
          ? {
              name: userResponse.user.username || null,
              email: userResponse.user.email || null,
            }
          : null,
      guest: userResponse.guest
        ? this.configManager.mapGuestDataToJson(userResponse.guest)
        : null,
      severityScores: this.calculateSeverity(userResponse),
      responseOnQuestions: userResponse.responseOnQuestions.map((response) => {
        let answer: any = null;

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
          if (response.question.answerOptions.length > 0) {
            response.question.answerOptions.map((index) => {});
          }

          answer = answerQuestion;
        } else if (response.question.questionType === 'INPUT_TEXT') {
          answer = response.answerText ?? null;
        } else if (response.question.questionType === 'RATING_SCALE') {
          answer = response.ratingValue ?? null;
        }

        return {
          questionId: response.question.id,
          headline: response.question.headline,
          questionType: response.question.questionType,
          answer,
        };
      }),
    }));

    // const caculSeverity = formattedData.map((format) => {
    //   const severityScores = this.calculateSeverity(format);
    //   return severityScores;
    // });
    // console.log(caculSeverity, 'severityScores');

    return plainToInstance(
      FormResponse,
      {
        formId,
        data: formattedData,
        meta: userResponsesPage.meta,
      },
      { excludeExtraneousValues: true },
    );
  }

  async getDetailResponsesByUsername(username: string, formId: number) {
    const existingForm =
      await this.formRepository.getSurveyFeedbackById(formId);
    if (!existingForm) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }

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
          ? this.configManager.mapGuestDataToJson(userResponse.guest)
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
    const form = await this.formRepository.getSurveyFeedbackById(formId);
    if (!form) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }
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
        if (response.ratingValue <= 2)
          score = 3; // High severity
        else if (response.answer === 3) score = 2; // Medium severity
      }

      if (
        response.question.questionType === 'INPUT_TEXT' &&
        response.answerText
      ) {
        const answerText = response.answerText.toLowerCase().trim();
        if (negativeWords.some((word) => answerText.includes(word))) {
          score = 3; // High severity nếu có từ tiêu cực
        }
      }

      severityScores.push(score);
    }

    if (severityScores.length === 0) return 'low'; // Nếu không có câu trả lời nào

    // Tính trung bình điểm severity
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
    responseData: {
      answer?: string;
      answerOptionId?: number | number[];
      ratingValue?: number;
    },
    userId?: number,
    sessionId?: string,
  ) {
    // Find or create UserOnResponse
    let userResponse =
      await this.userResponseRepository.getResponsesBySurveyAndUser(
        formId,
        userId || null,
        sessionId,
      );

    // If not found, create a new UserOnResponse
    if (!userResponse) {
      const guestData = !userId && sessionId ? { sessionId } : null;
      userResponse = await this.userResponseRepository.createUserOnResponse(
        formId,
        userId || null,
        guestData,
      );
    }

    // Get question type information
    const question = await this.questionService.getQuestionById(questionId);
    if (!question) {
      throw new NotFoundException(
        this.i18n.translate('errors.QUESTIONNOTFOUND'),
      );
    }

    // Delete old answers (if any)
    await this.userResponseRepository.deleteExistingResponses(
      userResponse.id,
      questionId,
      formId,
    );

    if (
      (!responseData.answerOptionId &&
        !responseData.answer &&
        !responseData.ratingValue) ||
      (Array.isArray(responseData.answerOptionId) &&
        responseData.answerOptionId.length === 0)
    ) {
      return await this.userResponseRepository.createResponseSkiped(
        userResponse.id,
        questionId,
        formId,
        true,
      );
    }

    // Create answer data based on question type
    switch (question.questionType) {
      case 'SINGLE_CHOICE':
      case 'PICTURE_SELECTION':
        if (typeof responseData.answerOptionId === 'number') {
          await this.userResponseRepository.createSingleChoiceResponse(
            userResponse.id,
            questionId,
            formId,
            responseData.answerOptionId,
          );
        }
        break;

      case 'MULTI_CHOICE':
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
        }
        break;

      case 'INPUT_TEXT':
        if (responseData.answer) {
          await this.userResponseRepository.createTextResponse(
            userResponse.id,
            questionId,
            formId,
            responseData.answer,
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

  async getPreviousQuestion(
    surveyId: number,
    currentQuestionId: number,
    userId?: number,
    sessionId?: string,
    tx?: any,
  ) {
    const currentQuestion =
      await this.questionService.getQuestionById(currentQuestionId);
    if (!currentQuestion) {
      return null;
    }
    let previousIndex = currentQuestion.index - 1;
    let previousQuestion = null;

    while (previousIndex >= 0) {
      previousQuestion = await this.questionService.getIndexQuestionById(
        surveyId,
        previousIndex,
      );

      if (previousQuestion) {
        break;
      }

      previousIndex--;
    }

    const question = await this.questionService.getQuestionById(previousIndex);
    return question;
  }

  async getPreviosResponse(
    surveyId: number,
    userId?: number | null,
    sessionId?: string,
  ) {
    const result =
      await this.userResponseRepository.getResponsesBySurveyAndUser(
        surveyId,
        userId,
        sessionId,
      );

    return result;
  }
}
