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
  ) {}

  async getStatusAnonymous(formId: number) {
    const form = await this.formRepository.getsurveyFeedbackById(formId);
    if(!form){
      throw new BadRequestException(this.i18n.translate('errors.'));
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
        this.i18n.translate('errors.SURVEYNOTFOUNDFORTHISBUSINESS'),
      );
    }

    if (existingForm.status == 'DRAFT' || existingForm.status == 'COMPLETED') {
      throw new BadRequestException('');
    }

    const settings = await this.formSetting.getAllFormSettingBusiness(
      businessId,
      formId,
    );
    const transformedSettings: FormSettingDto[] = settings.map((setting) => ({
      key: setting.key,
      settings: {
        enabled: (setting.value as any)?.enabled,
        limit: (setting.value as any)?.limit,
        date: (setting.value as any)?.date,
        position: (setting.value as any)?.position,
      },
    }));
    console.log(settings);

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
        createResponse,
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

  // async saveGuestInfoAndResponsesAllowAnonymous(
  //   businessId: number,
  //   formId: number,
  //   createResponse: CreateResponseOnQuestionDto,
  // ) {
  //   const existingForm =
  //     await this.formRepository.getsurveyFeedbackById(formId);
  //   if (!existingForm.allowAnonymous) {
  //     throw new BadRequestException(
  //       this.i18n.translate('errors.NOTALLOWANONYMOUSE'),
  //     );
  //   }
  //   return this.saveGuestInfoAndResponses(businessId, formId, createResponse);
  // }

  // async saveGuestInfoAndResponsesNotAllowAnonymous(
  //   businessId: number,
  //   formId: number,
  //   createResponse: CreateResponseOnQuestionDto,
  //   userId: number,
  // ) {
  //   return this.saveGuestInfoAndResponses(
  //     businessId,
  //     formId,
  //     createResponse,
  //     userId,
  //   );
  // }

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

    responses.forEach((response) => {
      const questionSetting = settings.find(
        (setting) => setting.key === response.questionType,
      );

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
      switch (response.questionType) {
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

  async getFormRate(formId: number): Promise<any> {
    const totalResponses =
      await this.responseQuestionRepository.totalResponses(formId);

    const questions = await this.responseQuestionRepository.getAll(formId);

    const detailedResponses = questions.map((question) => {
      const responses = [];
      let totalQuestionResponses = 0;

      if (
        question.questionType === 'SINGLE_CHOICE' ||
        question.questionType === 'MULTI_CHOICE' ||
        question.questionType === 'PICTURE_SELECTION'
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

          if (question.questionType === 'PICTURE_SELECTION') {
            responseObj.mediaUrls = option.answerOptionOnMedia.map(
              (media) => media.media.url,
            );
          }

          responses.push(responseObj);
        });
        totalQuestionResponses = totalQuestion;
      } else if (question.questionType === 'RATING_SCALE') {
        const configurations = question.businessQuestionConfiguration;

        let range = 0;
        if (Array.isArray(configurations)) {
          const rangeSetting = configurations.find((config) => {
            const settings = config.settings as any;
            return parseInt(settings.range);
          });

          console.log(rangeSetting, 'rangeSetting');

          if (rangeSetting) {
            const settings = rangeSetting.settings as any;
            range = parseInt(settings.range);
          }
        }

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
      } else if (question.questionType === 'INPUT_TEXT') {
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

  async getUserResponseDetails(formId: number) {
    const existingForm =
      await this.formRepository.getsurveyFeedbackById(formId);
    if (!existingForm) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }

    const userResponses =
      await this.userResponseRepository.getAllDetailResponesFromUser(formId);
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
          ? {
              name: (userResponse.guest as { name?: string }).name || '',
              address:
                (userResponse.guest as { address?: string }).address || '',
              phoneNumber:
                (userResponse.guest as { phoneNumber?: string }).phoneNumber ||
                '',
            }
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
            mediaUrl: option.answerOptionOnMedia.map(
              (media) => media.media.url,
            ),
          })),
      })),
    }));

    // Transform the formatted data into the proper DTO using plainToInstance
    return plainToInstance(
      FormResponse,
      { formId, userResponses: formattedData },
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
          ? {
              name: (userResponse.guest as { name?: string }).name || '',
              address:
                (userResponse.guest as { address?: string }).address || '',
              phoneNumber:
                (userResponse.guest as { phoneNumber?: string }).phoneNumber ||
                '',
            }
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
            mediaUrl: option.answerOptionOnMedia.map(
              (media) => media.media.url,
            ),
          })),
      })),
    }));

    // Chuyển đổi dữ liệu sang DTO bằng `plainToInstance`
    return plainToInstance(
      FormResponse,
      { formId, userResponses: formattedData },
      { excludeExtraneousValues: true },
    );
  }
}
