import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AddQuestionDto } from './dtos/add.question.dto';

import { AddAnswerOptionDto } from '../answer-option/dtos/add.answer.option.dto';
import { PrismaQuestionRepository } from 'src/repositories/prisma-question.repository';
import { UpdateQuestionDto } from './dtos/update.question.dto';
import { I18nService } from 'nestjs-i18n';
import { defaultQuestionSettings } from 'src/config/settings/default.question.settings';
import { QuestionType } from 'src/models/enums/QuestionType';
import { QuestionConditionService } from 'src/question-condition/question-condition.service';
import { MediaService } from 'src/media/media.service';
import { AnswerOptionService } from 'src/answer-option/answer-option.service';
import { SurveyFeedackFormService } from 'src/surveyfeedback-form/surveyfeedback-form.service';
import { CreateQuestionConditionDto } from 'src/question-condition/dtos/create-question-condition-dto';
import { console } from 'inspector';

@Injectable()
export class QuestionService {
  constructor(
    private prismaQuestionRepository: PrismaQuestionRepository,
    private surveyFeedackFormService: SurveyFeedackFormService,
    private answerOptionService: AnswerOptionService,
    private questionConditionService: QuestionConditionService,
    private readonly i18n: I18nService,
    private mediaService: MediaService,
  ) {}

  private async validateForm(formId: number) {
    const form =
      await this.surveyFeedackFormService.getSurveyFeedbackById(formId);
    if (!form) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }
    return form;
  }

  private async validateQuestion(questionId: number) {
    const question =
      await this.prismaQuestionRepository.getQuessionById(questionId);
    if (!question) {
      throw new BadRequestException(
        this.i18n.translate('errors.QUESTIONNOTFOUND'),
      );
    }
    return question;
  }

  async deleteOptionAnwser(
    questionId: number,
    optionAnwerId: number,
    surveyFeedBackId: number,
  ) {
    await this.validateForm(surveyFeedBackId);

    const quantityAnserOption =
      await this.answerOptionService.getQuantityAnserOptionbyQuestionId(
        questionId,
      );
    if (quantityAnserOption <= 2) {
      throw new BadRequestException(
        this.i18n.translate('errors.ANSWEROPTIONSMUSTBEGREATERTHANTWO'),
      );
    }

    await this.validateQuestion(questionId);

    return this.answerOptionService.deleteAnserOption(
      optionAnwerId,
      questionId,
    );
  }

  async getAllQuestion(formId: number) {
    await this.validateForm(formId);
    return this.prismaQuestionRepository.findAllQuestion(formId);
  }
  async addAndUpdateQuestions(
    formId: number,
    updateQuestionsDtos: UpdateQuestionDto[],
  ) {
    const currentMaxIndex =
      await this.prismaQuestionRepository.getMaxQuestionIndex(formId);
    let nextIndex = currentMaxIndex + 1;
    const results = [];

    for (const updateQuestionDto of updateQuestionsDtos) {
      const { questionType, questionId } = updateQuestionDto;
      if (questionId) {
        const question = await this.validateQuestion(questionId);
        if (questionType !== question.questionType) {
          await this.prismaQuestionRepository.deleteQuestionById(questionId);
          const handler = this.getHandlerForQuestionType(questionType);
          const result = await handler(formId, updateQuestionDto, nextIndex);
          results.push(result);
          nextIndex++;
        } else {
          const result = await this.updateQuestion(
            questionId,
            formId,
            updateQuestionDto,
          );
          results.push(result);
        }
      } else {
        const handler = this.getHandlerForQuestionType(questionType);
        const result = await handler(formId, updateQuestionDto, nextIndex);
        results.push(result);
        nextIndex++;
      }
    }

    return results;
  }

  private async updateQuestion(
    questionId: number,
    formId: number,
    updateQuestionDto: UpdateQuestionDto,
  ) {
    const question = await this.validateQuestion(questionId);
    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found.`);
    }

    // Handle image update if provided
    if (updateQuestionDto.imageId !== undefined) {
      const questionOnMedia =
        await this.mediaService.getQuestionOnMediaByQuestionId(questionId);

      // Only update image if it's changed or if there was no previous image
      if (
        updateQuestionDto.imageId !== questionOnMedia?.mediaId ||
        question.questionOnMedia === null
      ) {
        if (updateQuestionDto.imageId) {
          await this.updateQuestionImage(questionId, updateQuestionDto.imageId);
        }

        // Delete old media if it exists
        if (questionOnMedia) {
          await this.mediaService.deleteMediaById(questionOnMedia.mediaId);
        }
      }
    }

    // Update the question basic info
    const updatedQuestion = await this.prismaQuestionRepository.updateQuestion(
      questionId,
      updateQuestionDto,
    );

    // Update question settings
    if (updateQuestionDto.settings) {
      await this.prismaQuestionRepository.updateQuestionSetting(
        questionId,
        updateQuestionDto.settings,
        formId,
      );
    }

    // Update answer options if provided
    if (updateQuestionDto.answerOptions) {
      await this.updateAnswerOptions(questionId, updateQuestionDto);
    }

    // Handle conditions
    if (updateQuestionDto.conditions !== undefined) {
      await this.updateQuestionConditions(
        questionId,
        updateQuestionDto.conditions,
      );
    }

    return updatedQuestion;
  }

  private async updateAnswerOptions(
    questionId: number,
    updateQuestionDto: UpdateQuestionDto,
  ) {
    const answerOptionsId: number[] = [];

    if (updateQuestionDto.answerOptions) {
      await Promise.all(
        updateQuestionDto.answerOptions.map(async (option) => {
          if (option.answerOptionId) {
            await this.answerOptionService.updateAnswerOptions(
              option.answerOptionId,
              option,
            );
            answerOptionsId.push(option.answerOptionId);
            if (option.imageIds) {
              await this.updateAnswerOptionImages(
                option.answerOptionId,
                option.imageIds,
              );
            }
          } else {
            const index =
              await this.answerOptionService.getQuantityAnserOptionbyQuestionId(
                questionId,
              );
            const createdOption =
              await this.answerOptionService.createAnswerOptions(
                questionId,
                option,
                index,
              );
            answerOptionsId.push(createdOption.id);
            if (
              updateQuestionDto.questionType ===
                QuestionType.PICTURE_SELECTION &&
              option.imageIds
            ) {
              await this.updateAnswerOptionImages(
                createdOption.id,
                option.imageIds,
              );
            }
          }
        }),
      );

      await this.deleteAnswerOptions(questionId, answerOptionsId);
    }
  }

  private async deleteAnswerOptions(
    questionId: number,
    answerOptionsId: number[],
  ) {
    const answerOptionsInDb =
      await this.answerOptionService.findanswerOptionsByQuestionId(questionId);
    const idsToDelete = answerOptionsInDb
      .filter((option) => !answerOptionsId.includes(option.id))
      .map((option) => option.id);

    if (idsToDelete.length > 0) {
      await Promise.all(
        idsToDelete.map((id) =>
          this.answerOptionService.deleteAnserOption(id, questionId),
        ),
      );
    }
  }

  private async updateQuestionImage(questionId: number, imageId: number) {
    const existingImage =
      await this.mediaService.getQuestionOnMediaByMediaId(imageId);
    if (!existingImage) {
      throw new NotFoundException(this.i18n.translate('errors.IMAGENOTFOUND'));
    }
    await this.mediaService.updateQuestionOnMedia(questionId, existingImage.id);
  }

  private async updateAnswerOptionImages(
    answerOptionId: number,
    imageIds: number,
  ) {
    await this.mediaService.updateAnswerOptionOnMedia(imageIds, answerOptionId);
  }

  private getHandlerForQuestionType = (questionType: QuestionType) => {
    const handlers = {
      [QuestionType.SINGLE_CHOICE]: this.handleChoiceQuestion.bind(this),
      [QuestionType.MULTI_CHOICE]: this.handleChoiceQuestion.bind(this),
      [QuestionType.PICTURE_SELECTION]:
        this.handlePictureSelectionQuestion.bind(this),
      [QuestionType.INPUT_TEXT]: this.handleInputText.bind(this),
      [QuestionType.RATING_SCALE]: this.handleRating.bind(this),
    };
    const handler = handlers[questionType];
    if (!handler) {
      throw new BadRequestException(
        this.i18n.translate('errors.INVALID_QUESTION_TYPE', {
          args: { type: questionType },
        }),
      );
    }
    return handler;
  };

  private async handleRating(
    formId: number,
    addQuestionDto: AddQuestionDto,
    sortOrder: number,
  ) {
    return this.createQuestion(formId, addQuestionDto, sortOrder);
  }
  private async handleInputText(
    formId: number,
    addQuestionDto: AddQuestionDto,
    sortOrder: number,
  ) {
    return this.createQuestion(formId, addQuestionDto, sortOrder);
  }

  private async handleChoiceQuestion(
    formId: number,
    addQuestionDto: AddQuestionDto,
    sortOrder: number,
  ) {
    return this.createQuestion(formId, addQuestionDto, sortOrder);
  }
  private async handlePictureSelectionQuestion(
    formId: number,
    addQuestionDto: AddQuestionDto,
    sortOrder: number,
  ) {
    return this.createQuestion(formId, addQuestionDto, sortOrder);
  }

  async createQuestion(
    formId: number,
    addQuestionDto: AddQuestionDto,
    sortOrder?: number,
  ) {
    const { answerOptions, imageId } = addQuestionDto;

    console.log('Creating question with data:', answerOptions);

    if (answerOptions && answerOptions.length < 2) {
      throw new BadRequestException(
        this.i18n.translate('errors.MUSTHAVEATLEASTTWOCHOICES'),
      );
    }

    const questionIndex =
      sortOrder ||
      (await this.prismaQuestionRepository.getMaxQuestionIndex(formId)) + 1;

    const question = await this.prismaQuestionRepository.createQuestion(
      formId,
      addQuestionDto,
      questionIndex,
    );

    if (answerOptions) {
      await this.createAnswerOptions(question.id, answerOptions);
    }

    await this.createQuestionSettings(
      question.id,
      addQuestionDto.settings,
      addQuestionDto.questionType,
      formId,
    );

    if (
      addQuestionDto.questionType === QuestionType.PICTURE_SELECTION &&
      imageId
    ) {
      await this.updateQuestionImage(question.id, imageId);
    }

    return question;
  }

  private async createAnswerOptions(
    questionId: number,
    answerOptions: AddAnswerOptionDto[],
  ) {
    const index =
      await this.answerOptionService.getQuantityAnserOptionbyQuestionId(
        questionId,
      );
    await Promise.all(
      answerOptions.map(async (option, idx) => {
        const newIndex = index + idx + 1;
        const createdOption =
          await this.answerOptionService.createAnswerOptions(
            questionId,
            option,
            newIndex,
          );
        if (option.imageIds) {
          await this.updateAnswerOptionImages(
            createdOption.id,
            option.imageIds,
          );
        }
      }),
    );
  }

  async createAnwerOptionMedia(image: Express.Multer.File[]) {
    const mediaIds = await this.mediaService.uploadImages(image);
    await this.mediaService.createAnswerOptionOnMedia(
      mediaIds.map((mediaId) => ({ mediaId, answerOptionId: null })),
    );
  }

  async createQuestionMedia(image: Express.Multer.File) {
    const mediaId = await this.mediaService.uploadImage(image);
    await this.mediaService.createQuestionOnMedia({
      mediaId: mediaId,
      questionId: null,
    });
  }

  async deleteMediaById(mediaId: number) {
    return await this.mediaService.deleteMediaById(mediaId);
  }

  async deleteQuestionById(questionId: number, formId: number) {
    await this.validateForm(formId);
    await this.prismaQuestionRepository.deleteQuestionById(questionId);
  }

  async createDefaultQuestionConfigByAdmin() {
    await Promise.all(
      defaultQuestionSettings.map(({ key, settings }) =>
        this.prismaQuestionRepository.createDefaultQuestionConfigByAdmin(
          key,
          settings,
        ),
      ),
    );
  }

  async getSettingByQuestionType(type: QuestionType) {
    return await this.prismaQuestionRepository.getSettingByQuestionType(type);
  }

  async reorderQuestion(
    formId: number,
    questionId: number,
    newIndex: number,
  ): Promise<void> {
    const form =
      await this.surveyFeedackFormService.getSurveyFeedbackById(formId);

    const question =
      await this.prismaQuestionRepository.getQuessionById(questionId);
    if (!question) throw new NotFoundException('Question not found');

    const oldIndex = question.index;
    if (oldIndex === newIndex) return;

    if (newIndex < oldIndex) {
      await this.prismaQuestionRepository.shiftIndexes(
        form.id,
        oldIndex,
        newIndex,
        'up',
      );
    } else {
      await this.prismaQuestionRepository.shiftIndexes(
        form.id,
        oldIndex,
        newIndex,
        'down',
      );
    }

    await this.prismaQuestionRepository.updateIndexQuestion(
      questionId,
      newIndex,
    );
  }

  async createQuestionSettings(
    questionId: number,
    settings,
    key: string,
    formId: number,
  ) {
    return await this.prismaQuestionRepository.createQuestionSettings(
      questionId,
      settings,
      key,
      formId,
    );
  }

  private async updateQuestionConditions(
    questionId: number,
    conditions: CreateQuestionConditionDto[],
  ) {
    const existingConditions =
      await this.questionConditionService.findAllByQuestionId(questionId);

    if (!conditions || conditions.length === 0) {
      if (existingConditions.length > 0) {
        await Promise.all(
          existingConditions.map((cond) =>
            this.questionConditionService.delete(cond.id),
          ),
        );
      }
      return;
    }

    // Map để lưu questionLogicId theo conditionValue (thay vì questionId)
    const questionLogicMap = new Map<string, number>(); // Key là JSON.stringify(conditionValue)

    // Giả sử conditions là mảng phẳng, xử lý theo cặp SOURCE-TARGET
    for (let i = 0; i < conditions.length; i += 2) {
      const sourceCondition = conditions[i];
      const targetCondition = conditions[i + 1];

      if (
        !sourceCondition ||
        !targetCondition ||
        sourceCondition.role !== 'SOURCE' ||
        targetCondition.role !== 'TARGET'
      ) {
        console.error(`Invalid condition pair at index ${i}`);
        continue;
      }

      try {
        const conditionKey = JSON.stringify(sourceCondition.conditionValue); // Dùng conditionValue làm key

        // Xử lý SOURCE
        const conditionData: CreateQuestionConditionDto = {
          questionId: sourceCondition.questionId,
          role: sourceCondition.role,
          conditionType: sourceCondition.conditionType,
          conditionValue: sourceCondition.conditionValue,
          logicalOperator: sourceCondition.logicalOperator,
        };

        const questionLogicId =
          await this.questionConditionService.handleSourceCondition(
            questionId,
            conditionData,
          );
        console.log('SOURCE: questionLogicId =', questionLogicId);
        questionLogicMap.set(conditionKey, questionLogicId);

        // Xử lý TARGET
        const targetData: CreateQuestionConditionDto = {
          questionId: targetCondition.questionId,
          role: targetCondition.role,
          conditionType: null,
          conditionValue: null,
          logicalOperator: null,
        };

        await this.questionConditionService.handleTargetCondition(
          questionId,
          questionLogicId,
          targetData,
        );
        console.log('TARGET processed for questionLogicId =', questionLogicId);
      } catch (error) {
        console.error(
          `Error processing condition pair for question ${questionId}:`,
          error,
        );
      }
    }

    // Xóa các điều kiện cũ không còn trong danh sách mới
    const newConditionKeys = conditions
      .filter((c) => c.role === 'SOURCE')
      .map((c) => `${c.questionId}-${JSON.stringify(c.conditionValue)}`);
    await Promise.all(
      existingConditions
        .filter(
          (ec) =>
            !newConditionKeys.includes(
              `${ec.questionId}-${JSON.stringify(ec.questionLogic.conditionValue)}`,
            ),
        )
        .map((ec) => this.questionConditionService.delete(ec.id)),
    );
  }

  async getQuestionById(questionId: number) {
    return await this.prismaQuestionRepository.getQuessionById(questionId);
  }
  async getQuestionSettingByFormId(formId: number) {
    return await this.prismaQuestionRepository.getSettingByFormId(formId);
  }

  async getQuestionSettingByQuestionId(questionId: number) {
    return await this.prismaQuestionRepository.getSettingByQuestionId(
      questionId,
    );
  }

  async getIndexQuestionById(formId: number, index: number) {
    return await this.prismaQuestionRepository.getIndexQuestionById(
      formId,
      index,
    );
  }

  async getQuestionsFromIndex(formId: number, startIndex: number) {
    const question =
      await this.prismaQuestionRepository.getAllQuestionsFromIndex(
        formId,
        startIndex,
      );
    return question.map((data) => {
      return {
        id: data.id,
        headline: data.headline,
      };
    });
  }

   validateQuestions(questions: UpdateQuestionDto[]): {
    isValid: boolean;
    errors: string[];
  } {
    if (!Array.isArray(questions) || questions.length === 0) {
      return {
        isValid: false,
        errors: [this.i18n.translate('errors.QUESTIONS_MUST_BE_ARRAY')],
      };
    }

    const errors: string[] = [];

    // Kiểm tra trùng questionId
    const questionIds = questions.map((q) => q.questionId).filter(Boolean);
    if (new Set(questionIds).size !== questionIds.length) {
      errors.push(this.i18n.translate('errors.DUPLICATE_QUESTION_IDS'));
    }

    const validQuestionTypes = new Set(Object.values(QuestionType));

    // Duyệt từng câu hỏi và kiểm tra
    questions.forEach((question, index) => {
      const questionIndex = index + 1;

      if (!question.headline) {
        errors.push(
          this.i18n.translate('errors.MISSING_HEADLINE', {
            args: { index: questionIndex },
          }),
        );
      }

      if (
        !question.questionType ||
        !validQuestionTypes.has(question.questionType as QuestionType)
      ) {
        errors.push(
          this.i18n.translate('errors.INVALID_QUESTION_TYPE', {
            args: { type: question.questionType, index: questionIndex },
          }),
        );
      }

      if (
        ['SINGLE_CHOICE', 'MULTI_CHOICE', 'PICTURE_SELECTION'].includes(
          question.questionType,
        )
      ) {
        this.validateAnswerOptions(question, questionIndex, errors);
      }

      if (question.questionType === 'RATING_SCALE') {
        this.validateRatingScale(question, questionIndex, errors);
      }

      if (question.conditions?.length) {
        this.validateConditions(question.conditions, questionIndex, errors);
      }
    });

    return { isValid: errors.length === 0, errors };
  }
   validateAnswerOptions(
    question: UpdateQuestionDto,
    index: number,
    errors: string[],
  ) {
    if (
      !Array.isArray(question.answerOptions) ||
      question.answerOptions.length < 2
    ) {
      errors.push(
        this.i18n.translate('errors.MUSTHAVEATLEASTTWOCHOICES', {
          args: { index },
        }),
      );
      return;
    }

    const optionIds = question.answerOptions
      .map((opt) => opt.answerOptionId)
      .filter(Boolean);
    if (new Set(optionIds).size !== optionIds.length) {
      errors.push(
        this.i18n.translate('errors.DUPLICATE_OPTION_IDS', { args: { index } }),
      );
    }

    if (question.answerOptions.some((opt) => !opt.label)) {
      errors.push(
        this.i18n.translate('errors.MISSING_OPTION_LABELS', {
          args: { index },
        }),
      );
    }
  }

   validateRatingScale(
    question: UpdateQuestionDto,
    index: number,
    errors: string[],
  ) {
    if (
      !question.settings?.range ||
      question.settings.range < 2 ||
      question.settings.range > 10
    ) {
      errors.push(
        this.i18n.translate('errors.INVALID_RATING_RANGE', { args: { index } }),
      );
    }
  }

   validateConditions(
    conditions: CreateQuestionConditionDto[],
    index: number,
    errors: string[],
  ) {
    const validRoles = new Set(['SOURCE', 'TARGET']);
    const validConditionTypes = new Set([
      'EQUALS',
      'NOT_EQUALS',
      'GREATER_THAN',
      'LESS_THAN',
    ]);

    conditions.forEach((condition) => {
      if (!condition.questionId) {
        errors.push(
          this.i18n.translate('errors.MISSING_CONDITION_QUESTION_ID', {
            args: { index },
          }),
        );
      }

      if (!validRoles.has(condition.role)) {
        errors.push(
          this.i18n.translate('errors.INVALID_CONDITION_ROLE', {
            args: { index, role: condition.role },
          }),
        );
      }

      if (condition.role === 'SOURCE') {
        if (!validConditionTypes.has(condition.conditionType)) {
          errors.push(
            this.i18n.translate('errors.INVALID_CONDITION_TYPE', {
              args: { index, type: condition.conditionType },
            }),
          );
        }

        if (!condition.conditionValue) {
          errors.push(
            this.i18n.translate('errors.MISSING_CONDITION_VALUE', {
              args: { index },
            }),
          );
        }
      }
    });
  }
}
