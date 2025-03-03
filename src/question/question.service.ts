import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AddQuestionDto } from './dtos/add.question.dto';

import { AddAnswerOptionDto } from '../answer-option/dtos/add.answer.option.dto';
import { PrismaQuestionRepository } from 'src/repositories/prisma-question.repository';
import { PrismaMediaRepository } from 'src/repositories/prisma-media.repository';
import { UpdateQuestionDto } from './dtos/update.question.dto';
import { I18nService } from 'nestjs-i18n';
import { defaultQuestionSettings } from 'src/config/settings/default.question.settings';
import { QuestionType } from 'src/models/enums/QuestionType';
import { QuestionConditionService } from 'src/question-condition/question-condition.service';
import { PrismaSurveyFeedbackRepository } from 'src/repositories/prisma-survey-feeback.repository';
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

  private async validateForm(formId: number, tx?: any) {
    const form =
      await this.surveyFeedackFormService.getSurveyFeedbackById(formId);
    if (!form) {
      throw new BadRequestException(
        this.i18n.translate('errors.SURVEYFEEDBACKNOTFOUND'),
      );
    }
    return form;
  }

  private async validateQuestion(questionId: number, tx?: any) {
    const question = await this.prismaQuestionRepository.getQuessionById(
      questionId,
      tx,
    );
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
    updateQuestionsDto: UpdateQuestionDto[],
    tx?: any,
  ) {
    const form = await this.validateForm(formId, tx);

    const currentMaxIndex =
      await this.prismaQuestionRepository.getMaxQuestionIndex(form.id, tx);
    let nextIndex = currentMaxIndex + 1;
    const results = [];

    for (const updateQuestionDto of updateQuestionsDto) {
      const { questionType, questionId } = updateQuestionDto;
      if (questionId) {
        const question = await this.validateQuestion(questionId, tx);
        if (questionType !== question.questionType) {
          await this.prismaQuestionRepository.deleteQuestionById(
            questionId,
            tx,
          );
          const handler = this.getHandlerForQuestionType(questionType);
          const result = await handler(
            form.id,
            updateQuestionDto,
            nextIndex,
            tx,
          );
          results.push(result);
          nextIndex++;
        } else {
          const result = await this.updateQuestion(
            questionId,
            form.id,
            updateQuestionDto,
            tx,
          );
          results.push(result);
        }
      } else {
        const handler = this.getHandlerForQuestionType(questionType);
        const result = await handler(form.id, updateQuestionDto, nextIndex, tx);
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
    tx?: any,
  ) {
    const question = await this.validateQuestion(questionId, tx);
    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found.`);
    }

    // Handle image update if provided
    if (updateQuestionDto.imageId !== undefined) {
      const questionOnMedia =
        await this.mediaService.getQuestionOnMediaByQuestionId(questionId, tx);

      // Only update image if it's changed or if there was no previous image
      if (
        updateQuestionDto.imageId !== questionOnMedia?.mediaId ||
        question.questionOnMedia === null
      ) {
        if (updateQuestionDto.imageId) {
          await this.updateQuestionImage(
            questionId,
            updateQuestionDto.imageId,
            tx,
          );
        }

        // Delete old media if it exists
        if (questionOnMedia) {
          await this.mediaService.deleteMediaById(questionOnMedia.mediaId, tx);
        }
      }
    }

    // Update the question basic info
    const updatedQuestion = await this.prismaQuestionRepository.updateQuestion(
      questionId,
      updateQuestionDto,
      tx,
    );

    // Update question settings
    if (updateQuestionDto.settings) {
      await this.prismaQuestionRepository.updateQuestionSetting(
        questionId,
        updateQuestionDto.settings,
        formId,
        tx,
      );
    }

    // Update answer options if provided
    if (updateQuestionDto.answerOptions) {
      await this.updateAnswerOptions(questionId, updateQuestionDto, tx);
    }

    // Handle conditions
    if (updateQuestionDto.conditions !== undefined) {
      await this.updateQuestionConditions(
        questionId,
        updateQuestionDto.conditions,
        tx,
      );
    }

    return updatedQuestion;
  }

  private async updateAnswerOptions(
    questionId: number,
    updateQuestionDto: UpdateQuestionDto,
    tx?: any,
  ) {
    const answerOptionsId: number[] = [];

    if (updateQuestionDto.answerOptions) {
      await Promise.all(
        updateQuestionDto.answerOptions.map(async (option) => {
          if (option.answerOptionId) {
            await this.answerOptionService.updateAnswerOptions(
              option.answerOptionId,
              option,
              tx,
            );
            answerOptionsId.push(option.answerOptionId);
            if (option.imageIds) {
              await this.updateAnswerOptionImages(
                option.answerOptionId,
                option.imageIds,
                tx,
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
                tx,
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
                tx,
              );
            }
          }
        }),
      );

      await this.deleteAnswerOptions(questionId, answerOptionsId, tx);
    }
  }

  private async deleteAnswerOptions(
    questionId: number,
    answerOptionsId: number[],
    tx?: any,
  ) {
    const answerOptionsInDb =
      await this.answerOptionService.findanswerOptionsByQuestionId(
        questionId,
        tx,
      );
    const idsToDelete = answerOptionsInDb
      .filter((option) => !answerOptionsId.includes(option.id))
      .map((option) => option.id);

    if (idsToDelete.length > 0) {
      await Promise.all(
        idsToDelete.map((id) =>
          this.answerOptionService.deleteAnserOption(id, questionId, tx),
        ),
      );
    }
  }

  private async updateQuestionImage(
    questionId: number,
    imageId: number,
    tx?: any,
  ) {
    const existingImage = await this.mediaService.getQuestionOnMediaByMediaId(
      imageId,
      tx,
    );
    if (!existingImage) {
      throw new NotFoundException(this.i18n.translate('errors.IMAGENOTFOUND'));
    }
    await this.mediaService.updateQuestionOnMedia(
      questionId,
      existingImage.id,
      tx,
    );
  }

  private async updateAnswerOptionImages(
    answerOptionId: number,
    imageIds: number,
    tx?: any,
  ) {
    await this.mediaService.updateAnswerOptionOnMedia(
      imageIds,
      answerOptionId,
      tx,
    );
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
    tx?: any,
  ) {
    return this.createQuestion(formId, addQuestionDto, sortOrder, tx);
  }
  private async handleInputText(
    formId: number,
    addQuestionDto: AddQuestionDto,
    sortOrder: number,
    tx?: any,
  ) {
    return this.createQuestion(formId, addQuestionDto, sortOrder, tx);
  }

  private async handleChoiceQuestion(
    formId: number,
    addQuestionDto: AddQuestionDto,
    sortOrder: number,
    tx?: any,
  ) {
    return this.createQuestion(formId, addQuestionDto, sortOrder, tx);
  }
  private async handlePictureSelectionQuestion(
    formId: number,
    addQuestionDto: AddQuestionDto,
    sortOrder: number,
    tx?: any,
  ) {
    return this.createQuestion(formId, addQuestionDto, sortOrder, tx);
  }

  async createQuestion(
    formId: number,
    addQuestionDto: AddQuestionDto,
    sortOrder?: number,
    tx?: any,
  ) {
    const { answerOptions, imageId } = addQuestionDto;

    if (answerOptions && answerOptions.length < 2) {
      throw new BadRequestException(
        this.i18n.translate('errors.MUSTHAVEATLEASTTWOCHOICES'),
      );
    }

    const questionIndex =
      sortOrder ||
      (await this.prismaQuestionRepository.getMaxQuestionIndex(formId, tx)) + 1;

    const question = await this.prismaQuestionRepository.createQuestion(
      formId,
      addQuestionDto,
      questionIndex,
      tx,
    );

    if (answerOptions) {
      await this.createAnswerOptions(question.id, answerOptions, tx);
    }

    await this.createQuestionSettings(
      question.id,
      addQuestionDto.settings,
      addQuestionDto.questionType,
      formId,
      tx,
    );

    if (
      addQuestionDto.questionType === QuestionType.PICTURE_SELECTION &&
      imageId
    ) {
      await this.updateQuestionImage(question.id, imageId, tx);
    }

    return question;
  }

  private async createAnswerOptions(
    questionId: number,
    answerOptions: AddAnswerOptionDto[],
    tx?: any,
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
            tx,
          );
        if (option.imageIds) {
          await this.updateAnswerOptionImages(
            createdOption.id,
            option.imageIds,
            tx,
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

    console.log(form);
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

  async findAllQuestion(formId: number, tx?: any) {
    await this.validateForm(formId);
    return this.prismaQuestionRepository.findAllQuestion(formId, tx);
  }

  async createQuestionSettings(
    questionId: number,
    settings: any,
    key: string,
    formId: number,
    tx?: any,
  ) {
    return await this.prismaQuestionRepository.createQuestionSettings(
      questionId,
      settings,
      key,
      formId,
      tx,
    );
  }

  private async updateQuestionConditions(
    questionId: number,
    conditions: CreateQuestionConditionDto[],
    tx?: any,
  ) {
    const existingConditions =
      await this.questionConditionService.findAllByQuestionId(questionId);

    if (!conditions || conditions.length === 0) {
      if (existingConditions.length > 0) {
        await Promise.all(
          existingConditions.map((cond) =>
            this.questionConditionService.delete(cond.id, tx),
          ),
        );
      }
      return;
    }

    const processedConditions = new Set();
    const questionLogicMap = new Map<number, number>(); // Lưu questionLogicId theo questionId

    for (const conditionDto of conditions) {
      try {
        const conditionKey = `${conditionDto.questionId}-${conditionDto.role}`;

        if (processedConditions.has(conditionKey)) continue;
        processedConditions.add(conditionKey);

        const existingCondition = existingConditions.find(
          (cond) =>
            cond.questionId === conditionDto.questionId &&
            cond.role === conditionDto.role,
        );

        const conditionData: CreateQuestionConditionDto = {
          questionId: conditionDto.questionId,
          role: conditionDto.role,
          conditionType: conditionDto.conditionType,
          conditionValue: conditionDto.conditionValue,
          logicalOperator: conditionDto.logicalOperator,
        };

        if (conditionDto.role === 'SOURCE') {
          const questionLogicId =
            await this.questionConditionService.handleSourceCondition(
              questionId,
              conditionData,
              tx,
            );

          console.log('SOURCE: questionLogicId =', questionLogicId);

          // Lưu questionLogicId vào Map
          questionLogicMap.set(questionId, questionLogicId);
        }

        if (conditionDto.role === 'TARGET') {
          const questionLogicId = questionLogicMap.get(questionId); // Lấy từ Map
          console.log('TARGET: questionLogicId =', questionLogicId);

          await this.questionConditionService.handleTargetCondition(
            questionId,
            conditionData,
            questionLogicId, // Lúc này sẽ có giá trị nếu đã xử lý SOURCE trước đó
            tx,
          );
        }
      } catch (error) {
        console.error(
          `Error processing condition for question ${questionId}:`,
          error,
        );
      }
    }
  }
}
