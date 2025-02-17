import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FormResponse } from 'src/response-customization/user-responses.response';
import { ResponseDto } from './dtos/response.dto';
import { QuestionSetting } from './dtos/question.setting.dto';
import { CreateResponseOnQuestionDto } from './dtos/create.response.on.question.dto';
import { FormSettingDto } from './dtos/form.setting.dto';
import { PrismasurveyFeedbackRepository } from 'src/repositories/prisma-survey-feeback.repository';
import { PrismaUserResponseRepository } from 'src/repositories/prisma-user-response.repository';
import { PrismaResponseQuestionRepository } from 'src/repositories/prisma-response-question.repository';
import { PrismaQuestionRepository } from 'src/repositories/prisma-question.repository';
import { PrismaFormSettingRepository } from 'src/repositories/prisma-setting.repository';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/config/prisma.service';
import ConfigManager from 'src/config/configManager';
import { QuestionType } from 'src/models/enums/QuestionType';

@Injectable()
export class SurveyFeedbackDataService {
  constructor(
    private formRepository: PrismasurveyFeedbackRepository,
    private userResponseRepository: PrismaUserResponseRepository,
    private responseQuestionRepository: PrismaResponseQuestionRepository,
    private questionRepository: PrismaQuestionRepository,
    private formSetting: PrismaFormSettingRepository,
    private readonly i18n: I18nService,
    private prisma: PrismaService,
    private configManager: ConfigManager,
  ) {}

  async getStatusAnonymous(formId: number) {
    const form = await this.formRepository.getsurveyFeedbackById(formId);
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
  ) {
    const { guestData, responses } = createResponse;

    const existingForm =
      await this.formRepository.getsurveyFeedbackById(formId);
    if (!existingForm) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }

    // if (existingForm.status == 'DRAFT' || existingForm.status == 'COMPLETED') {
    //   throw new BadRequestException('');
    // }

    const settings = await this.formSetting.getAllFormSettingBusiness(
      businessId,
      formId,
    );
    console.log(settings, 'settings');
    const transformedSettings = this.configManager.transformSettings(settings);

    const validationFormErrors = await this.validateResponseOptions(
      formId,
      transformedSettings,
    );

    if (validationFormErrors.length > 0) {
      throw new BadRequestException(validationFormErrors);
    }

    const questionSettings =
      await this.questionRepository.getSettingByFormId(formId);
    const validationErrors = await this.validateQuestionResponses(
      responses,
      questionSettings,
    );
    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors);
    }

    await this.prisma.$transaction(async (tx) => {
      const userSurveyResponse = await this.userResponseRepository.create(
        formId,
        guestData,
        userId,
        tx,
      );

      const responsePromises = responses.map((response) => {
        const { questionId, answerOptionId, answerText, ratingValue } =
          response;

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
                tx, // Pass transaction context
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
            tx, // Pass transaction context
          );
        }
      });
      await Promise.all(responsePromises);
    });
  }

  async validateResponseOptions(
    formId: number,
    responseOptions: FormSettingDto[],
  ) {
    const errors: string[] = [];
    const currentDate = new Date();

    const totalResponses =
      await this.responseQuestionRepository.totalResponses(formId);

    responseOptions.forEach((formSetting) => {
      const { enabled, limit, date } = formSetting.settings;

      console.log(enabled, limit, date);

      if (enabled) {
        if (formSetting.key === 'closeOnResponseLimit') {
          if (enabled && totalResponses >= limit) {
            errors.push(
              this.i18n.translate('errors.RESPONSELIMITEXCEEDED', {
                args: { key: formSetting.key },
              }),
            );
          }
        } else if (formSetting.key === 'releaseOnDate') {
          if (enabled && date) {
            const releaseDate = new Date(date);
            if (releaseDate > currentDate) {
              errors.push(
                this.i18n.translate('errors.SURVEYNOTYETRELEASED', {
                  args: { date, key: formSetting.key },
                }),
              );
            }
          } else if (enabled && !date) {
            errors.push(
              this.i18n.translate('errors.RELEASEONDATEWITHOUTDATE', {
                args: { key: formSetting.key },
              }),
            );
          }
        } else if (formSetting.key === 'closeOnDate') {
          if (enabled && date) {
            const closeDate = new Date(date);
            console.log(closeDate, date, 'sddddd');
            console.log(closeDate <= currentDate, 'jaksjsjạ');
            if (closeDate <= currentDate) {
              errors.push(
                this.i18n.translate('errors.SURVEYCLOSED', {
                  args: { date, key: formSetting.key },
                }),
              );
            }
          } else if (enabled && !date) {
            errors.push(
              this.i18n.translate('errors.CLOSEONDATEWITHOUTDATE', {
                args: { key: formSetting.key },
              }),
            );
          }
        }
      }
    });

    return errors;
  }

  async validateQuestionResponses(
    responses: ResponseDto[],
    settings: QuestionSetting[],
  ) {
    const errors: string[] = [];

    responses.forEach(async (response) => {
      const type = await this.questionRepository.getQuessionById(
        response.questionId,
      );

      
      const questionSetting = settings.find(
        (setting) => setting.key === type.questionType,
      );
      console.log(questionSetting, 'questionSetting');

      if (!questionSetting) {
        errors.push(
          this.i18n.translate('errors.QUESTIONREQUIRESSELECTION', {
            args: { questionId: response.questionId },
          }),
        );
        return;
      }

      const { settings: questionSettings } = questionSetting;

      if (
        questionSettings.require &&
        !response.answerText &&
        !response.answerOptionId &&
        response.ratingValue === undefined
      ) {
        errors.push(
          this.i18n.translate('errors.QUESTIONREQUIRESSELECTION', {
            args: { questionId: response.questionId },
          }),
        );
        return;
      }

      // Kiểm tra loại câu hỏi
      switch (type.questionType) {
        case 'SINGLE_CHOICE':
        case 'PICTURE_SELECTION':
          if (questionSettings.require && !response.answerOptionId) {
            errors.push(
              `Question ID ${response.questionId} requires an answer.`,
            );
          }
          if (response.answerOptionId.length > questionSettings.maxSelections) {
            errors.push(
              `Question ID ${response.questionId} requires at most 2 choices `,
            );
          }
          break;

        case 'MULTI_CHOICE':
          if (response.answerOptionId) {
            if (
              response.answerOptionId.length <
              (questionSettings.minSelections || 1)
            ) {
              errors.push(
                this.i18n.translate('errors.QUESTIONREQUIRESSELECTION', {
                  args: { questionId: response.questionId },
                }),
              );
            }
            if (
              response.answerOptionId.length >
              (questionSettings.maxSelections || Infinity)
            ) {
              errors.push(
                `Question ID ${response.questionId} allows a maximum of ${questionSettings.maxSelections} selections.`,
              );
            }
          } else if (questionSettings.require) {
            errors.push(
              this.i18n.translate('errors.QUESTIONREQUIRESSELECTION', {
                args: { questionId: response.questionId },
              }),
            );
          }
          break;

        case 'INPUT_TEXT':
          if (questionSettings.require && !response.answerText) {
            errors.push(
              this.i18n.translate('errors.QUESTIONREQUIRESINPUTTEXT', {
                args: { questionId: response.questionId },
              }),
            );
          }
          break;

        case 'RATING_SCALE':
          if (
            questionSettings.isRequired &&
            response.ratingValue === undefined
          ) {
            errors.push(
              this.i18n.translate('errors.QUESTIONREQUIRESRATINGVALUE', {
                args: { questionId: response.questionId },
              }),
            );
          }

          if (
            response.ratingValue !== undefined &&
            (response.ratingValue > parseFloat(questionSettings.range) ||
              response.ratingValue <= 0)
          ) {
            errors.push(
              this.i18n.translate('errors.INVALIDRATINGVALUE', {
                args: { questionId: response.questionId },
              }),
            );
          }
          break;
        default:
          errors.push(
            `Unknown question type for question ID ${response.questionId}.`,
          );
      }
    });
    return errors;
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
      console.log(startDate, endDate, 'startDate, endDate');
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
        media = question.questionOnMedia.media.url;
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

        console.log(configurations, 'configurations');
        const range = this.configManager.getSettingValue(
          configurations,
          'range',
          0,
        );

        console.log(range, 'range');

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
    const form = await this.formRepository.getsurveyFeedbackById(formId);

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
      await this.formRepository.getsurveyFeedbackById(formId);
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
          const option = response.question.answerOptions.find(
            (opt) => opt.id === response.answerOptionId,
          );

          if (option) {
            answer =
              option.answerOptionOnMedia?.media?.url ?? option.label ?? null;
          } else {
            answer = null;
          }
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
      await this.formRepository.getsurveyFeedbackById(formId);
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
    console.log(userResponses);

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
    const form = await this.formRepository.getsurveyFeedbackById(formId);
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
        startDate = new Date(0); // Represents the earliest possible date
        break;
      case 'Custom': // Người dùng nhập vào ngày bắt đầu và kết thúc
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
    let severityScores: number[] = [];

    for (const response of form.responseOnQuestions) {
      let score = 1; // Mặc định là "low"

      console.log(response, 'response');
      if (
        response.question.questionType === 'RATING_SCALE' &&
        response.answer
      ) {
        if (response.answer <= 2)
          score = 3; // High severity
        else if (response.answer === 3) score = 2; // Medium severity
      }

      if (response.question.questionType === 'INPUT_TEXT' && response.answer) {
        const answerText = response.answer.toLowerCase().trim();
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

    // Quy đổi điểm trung bình về mức độ nghiêm trọng
    if (avgSeverity >= 2.5) return 'high';
    if (avgSeverity >= 1.5) return 'medium';

    console.log(avgSeverity, 'avgSeverity');
    return 'low';
  }
}
