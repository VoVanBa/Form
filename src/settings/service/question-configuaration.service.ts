import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { PrismaQuestionConfigurationRepository } from '../repositories/prisma-question-configuration.repository';
import { ResponseDto } from 'src/survey-feedback-data/dtos/response.dto';
import { QuestionSetting } from 'src/survey-feedback-data/dtos/question.setting.dto';
import { I18nService } from 'nestjs-i18n';
import { QuestionService } from 'src/question/service/question.service';

@Injectable()
export class QuestionConfigurationService {
  constructor(
    private readonly prismaQuestionConfigurationRepository: PrismaQuestionConfigurationRepository,
    private i18n: I18nService,
    @Inject(forwardRef(() => QuestionService))
    private readonly questionService: QuestionService,
  ) {}
  async getAllQuestionSettings(formId: number) {
    return await this.prismaQuestionConfigurationRepository.findAll(formId);
  }
  async validateResponsesByQuestionSettings(
    responses: ResponseDto | ResponseDto[], // Hỗ trợ cả object và array
    settings: QuestionSetting[] | QuestionSetting,
  ) {
    if (Array.isArray(responses)) {
      for (const response of responses) {
        await this.validateResponseAgainstSettings(response, settings);
      }
    } else {
      await this.validateResponseAgainstSettings(responses, settings);
    }
  }
  private async validateResponseAgainstSettings(
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
        this.i18n.translate('errors.QUESTION_REQUIRES_SELECTION', {
          args: { questionId: response.questionId },
        }),
      );
    }

    const isRequired = questionSetting.settings.required;

    if (isRequired && this.isEmptyResponse(response)) {
      throw new BadRequestException(
        this.i18n.translate('errors.QUESTION_REQUIRES_SELECTION', {
          args: { questionId: response.questionId },
        }),
      );
    }

    const otherAnswer = questionSetting.settings.other;

    if (!otherAnswer && response.otherAnswer) {
      throw new BadRequestException(
        this.i18n.translate('errors.QUESTION_NOT_REQUIRES_OTHER_ANSWER', {
          args: { questionId: response.questionId },
        }),
      );
    }

    this.validateResponseFormatByType(
      type.questionType,
      response,
      questionSetting,
    );
  }

  private validateResponseFormatByType(
    questionType: string,
    response: ResponseDto,
    questionSettings: any,
  ) {
    const isRequired = questionSettings?.required || false; // Kiểm tra có bắt buộc không
    const other = questionSettings?.settings?.other || false;

    const invalidKeys: string[] = [];

    switch (questionType) {
      case 'SINGLE_CHOICE':
      case 'PICTURE_SELECTION': {
        if (response.answerOptionId === undefined) {
          throw new BadRequestException(
            this.i18n.translate('errors.INVALID_ANSWER_FORMAT', {
              args: { questionId: response.questionId },
            }),
          );
        }

        if (
          (!other &&
            response.answerText !== undefined &&
            response.answerText !== undefined) ||
          response.ratingValue !== undefined ||
          response.otherAnswer !== undefined
        ) {
          invalidKeys.push('answerText', 'ratingValue', 'otherAnswer');
        }

        break;
      }

      case 'MULTI_CHOICE': {
        if (
          !Array.isArray(response.answerOptionId) ||
          response.answerOptionId.length === 0 ||
          response.answerOptionId.includes(undefined)
        ) {
          throw new BadRequestException(
            this.i18n.translate('errors.QUESTION_REQUIRES_SELECTION', {
              args: { questionId: response.questionId },
            }),
          );
        }

        if (
          !other &&
          (response.answerText != undefined ||
            response.ratingValue != undefined ||
            response.otherAnswer != undefined)
        ) {
          invalidKeys.push('answerText', 'ratingValue', 'otherAnswer');
        }
        break;
      }

      case 'INPUT_TEXT': {
        if (isRequired && !response.answerText) {
          throw new BadRequestException(
            this.i18n.translate('errors.QUESTION_REQUIRES_INPUT_TEXT', {
              args: { questionId: response.questionId },
            }),
          );
        }

        if (
          (Array.isArray(response.answerOptionId) &&
            response.answerOptionId.some((v) => v !== undefined)) ||
          (!Array.isArray(response.answerOptionId) &&
            response.answerOptionId !== undefined) ||
          response.ratingValue !== undefined
        ) {
          invalidKeys.push('answerOptionId', 'ratingValue');
        }

        break;
      }

      case 'RATING_SCALE': {
        const range = parseFloat(questionSettings?.settings?.range) || 5; // Mặc định 5 sao nếu không có
        if (
          typeof response.ratingValue !== 'number' ||
          response.ratingValue <= 0 ||
          response.ratingValue > range
        ) {
          throw new BadRequestException(
            this.i18n.translate('errors.INVALID_RATING_VALUE', {
              args: { questionId: response.questionId, max: range },
            }),
          );
        }

        if (
          (Array.isArray(response.answerOptionId) &&
            response.answerOptionId.some((v) => v !== undefined)) ||
          (!Array.isArray(response.answerOptionId) &&
            response.answerOptionId !== undefined) ||
          response.answerText !== undefined
        ) {
          invalidKeys.push('answerOptionId', 'ratingValue');
        }

        break;
      }

      default:
        throw new BadRequestException(
          `Unknown question type for question ID ${response.questionId}.`,
        );
    }

    if (invalidKeys.length > 0) {
      throw new BadRequestException(
        `Invalid keys for question type '${questionType}': ${invalidKeys.join(', ')}`,
      );
    }
  }

  private isEmptyResponse(response: ResponseDto): boolean {
    return (
      response.answerText == null &&
      (response.answerOptionId == null ||
        (Array.isArray(response.answerOptionId) &&
          response.answerOptionId.every((item) => item == null))) && // 🔥 Kiểm tra tất cả phần tử trong mảng đều là null
      response.ratingValue == null &&
      response.otherAnswer == null
    );
  }
}
