import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AddQuestionDto } from './dtos/add.question.dto';
import { v2 as cloudinary } from 'cloudinary';
import { AddAnswerOptionDto } from './dtos/add.answer.option.dto';
import { PrismaQuestionRepository } from 'src/repositories/prisma-question.repository';
import { PrismaMediaRepository } from 'src/repositories/prisma-media.repository';
import { UpdateQuestionDto } from './dtos/update.question.dto';
import { PrismaAnswerOptionRepository } from 'src/repositories/prisma-anwser-option.repository';
import { I18nService } from 'nestjs-i18n';
import { CloudinaryUploadResult } from './dtos/cloudinary.upload.result';
import { PrismaService } from 'src/config/prisma.service';
import { defaultQuestionSettings } from 'src/config/default.question.settings';
import { QuestionType } from 'src/models/enums/QuestionType';
import { QuestionConditionService } from 'src/question-condition/question-condition.service';
import { PrismaSurveyFeedbackRepository } from 'src/repositories/prisma-survey-feeback.repository';

@Injectable()
export class QuestionService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('CLOUDINARY') private readonly cloudinaryClient: typeof cloudinary,
    private prismaQuestionRepository: PrismaQuestionRepository,
    private prismaSurveuFeedBackRepository: PrismaSurveyFeedbackRepository,
    private prismaMediaRepository: PrismaMediaRepository,
    private prismaAnswerOptionRepository: PrismaAnswerOptionRepository,
    private questionConditionService: QuestionConditionService,
    private readonly i18n: I18nService,
  ) {}

  private async validateForm(formId: number, tx?: any) {
    const form =
      await this.prismaSurveuFeedBackRepository.getSurveyFeedbackById(
        formId,
        tx,
      );
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
      await this.prismaAnswerOptionRepository.getQuantityAnserOptionbyQuestionId(
        questionId,
      );
    if (quantityAnserOption <= 2) {
      throw new BadRequestException(
        this.i18n.translate('errors.ANSWEROPTIONSMUSTBEGREATERTHANTWO'),
      );
    }

    await this.validateQuestion(questionId);

    return this.prismaAnswerOptionRepository.deleteAnserOption(
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
    await this.validateForm(formId, tx);
    const currentMaxIndex =
      await this.prismaQuestionRepository.getMaxQuestionIndex(formId, tx);
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
            formId,
            updateQuestionDto,
            nextIndex,
            tx,
          );
          results.push(result);
          nextIndex++;
        } else {
          const result = await this.updateQuestion(
            questionId,
            formId,
            updateQuestionDto,
            tx,
          );
          results.push(result);
        }
      } else {
        const handler = this.getHandlerForQuestionType(questionType);
        const result = await handler(formId, updateQuestionDto, nextIndex, tx);
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

    if (updateQuestionDto.imageId) {
      const questionOnMedia =
        await this.prismaMediaRepository.getQuestionOnMediaByQuestionId(
          questionId,
          tx,
        );
      if (
        updateQuestionDto.imageId !== questionOnMedia?.mediaId ||
        question.questionOnMedia === null
      ) {
        await this.updateQuestionImage(
          questionId,
          updateQuestionDto.imageId,
          tx,
        );
        if (questionOnMedia) {
          await this.prismaMediaRepository.deleteMediaById(
            questionOnMedia.mediaId,
            tx,
          );
        }
      }
    }

    const updatedQuestion = await this.prismaQuestionRepository.updateQuestion(
      questionId,
      updateQuestionDto,
      tx,
    );
    await this.prismaQuestionRepository.updateQuestionSetting(
      questionId,
      updateQuestionDto.settings,
      formId,
      tx,
    );
    await this.updateAnswerOptions(questionId, updateQuestionDto, tx);

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
            await this.prismaAnswerOptionRepository.updateAnswerOptions(
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
              await this.prismaAnswerOptionRepository.getQuantityAnserOptionbyQuestionId(
                questionId,
                tx,
              );
            const createdOption =
              await this.prismaAnswerOptionRepository.createAnswerOptions(
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
      await this.prismaAnswerOptionRepository.findanswerOptionsByQuestionId(
        questionId,
        tx,
      );
    const idsToDelete = answerOptionsInDb
      .filter((option) => !answerOptionsId.includes(option.id))
      .map((option) => option.id);

    if (idsToDelete.length > 0) {
      await Promise.all(
        idsToDelete.map((id) =>
          this.prismaAnswerOptionRepository.deleteAnserOption(
            id,
            questionId,
            tx,
          ),
        ),
      );
    }
  }

  private async updateQuestionImage(
    questionId: number,
    imageId: number,
    tx?: any,
  ) {
    const existingImage =
      await this.prismaMediaRepository.getQuestionOnMediaByMediaId(imageId, tx);
    if (!existingImage) {
      throw new NotFoundException(this.i18n.translate('errors.IMAGENOTFOUND'));
    }
    await this.prismaMediaRepository.updateQuestionOnMedia(
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
    await this.prismaMediaRepository.updateAnswerOptionOnMedia(
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

  private async createQuestion(
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

    await this.prismaQuestionRepository.createQuestionSettings(
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
      await this.prismaAnswerOptionRepository.getQuantityAnserOptionbyQuestionId(
        questionId,
        tx,
      );
    await Promise.all(
      answerOptions.map(async (option, idx) => {
        const newIndex = index + idx + 1;
        const createdOption =
          await this.prismaAnswerOptionRepository.createAnswerOptions(
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

  async uploadImagesAndSaveToDB(files: Express.Multer.File[]): Promise<any> {
    const uploadResults = await Promise.all(
      files.map((file) => this.uploadImageToCloudinary(file)),
    );
    const mediaPromises = uploadResults.map((result, index) => {
      const file = files[index];
      return this.prismaMediaRepository.createMedia(
        result.secure_url,
        file.originalname,
        file.mimetype,
        file.size,
      );
    });
    const media = await Promise.all(mediaPromises);
    const mediaIds = media.map((m) => m.id);
    await this.prismaMediaRepository.createAnswerOptionOnMedia(
      mediaIds.map((mediaId) => ({ mediaId, answerOptionId: null })),
    );
    return mediaIds;
  }

  async uploadImage(image: Express.Multer.File): Promise<number> {
    const result = await this.uploadImageToCloudinary(image);
    const media = await this.prismaMediaRepository.createMedia(
      result.secure_url,
      image.originalname,
      image.mimetype,
      image.size,
    );
    await this.prismaMediaRepository.createQuestionOnMedia({
      mediaId: media.id,
      questionId: null,
    });
    return media.id;
  }

  private async uploadImageToCloudinary(
    file: Express.Multer.File,
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as CloudinaryUploadResult);
          }
        })
        .end(file.buffer);
    });
  }

  async deleteMediaById(mediaId: number) {
    return await this.prismaMediaRepository.deleteMediaById(mediaId);
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

  // async handleQuestionOrderUp(questionId: number, formId: number) {
  //   await this.validateForm(formId);
  //   const questions = await this.getAllQuestion(formId);
  //   const questionIndex = questions.findIndex((q) => q.id === questionId);
  //   if (questionIndex === -1) {
  //     throw new NotFoundException(
  //       this.i18n.translate('errors.QUESTIONNOTFOUND'),
  //     );
  //   }
  //   const prevQuestion = questions[questionIndex - 1];
  //   if (!prevQuestion) {
  //     return { message: this.i18n.translate('errors.ALREADYATTOP') };
  //   }
  //   await this.swapQuestionIndexes(questionId, prevQuestion.id);
  //   return { message: this.i18n.translate('messages.QUESTIONMOVEDUP') };
  // }

  // async handleQuestionOrderDown(questionId: number, formId: number) {
  //   await this.validateForm(formId);
  //   const questions = await this.getAllQuestion(formId);
  //   const questionIndex = questions.findIndex((q) => q.id === questionId);
  //   if (questionIndex === -1) {
  //     throw new NotFoundException(
  //       this.i18n.translate('errors.QUESTIONNOTFOUND'),
  //     );
  //   }
  //   const nextQuestion = questions[questionIndex + 1];
  //   if (!nextQuestion) {
  //     return { message: this.i18n.translate('errors.QUESTIONMOVEDDOWN') };
  //   }
  //   await this.swapQuestionIndexes(questionId, nextQuestion.id);
  //   return { message: this.i18n.translate('messages.QUESTIONMOVEDDOWN') };
  // }

  // private async swapQuestionIndexes(questionId1: number, questionId2: number) {
  //   const question1 =
  //     await this.prismaQuestionRepository.getQuessionById(questionId1);
  //   const question2 =
  //     await this.prismaQuestionRepository.getQuessionById(questionId2);
  //   await Promise.all([
  //     this.prismaQuestionRepository.updateIndexQuestion(
  //       questionId1,
  //       question2.index,
  //     ),
  //     this.prismaQuestionRepository.updateIndexQuestion(
  //       questionId2,
  //       question1.index,
  //     ),
  //   ]);
  // }

  async reorderQuestion(
    formId: number,
    questionId: number,
    newIndex: number,
  ): Promise<void> {
    const form =
      await this.prismaSurveuFeedBackRepository.getSurveyFeedbackById(formId);

    console.log(form);
    const question =
      await this.prismaQuestionRepository.getQuessionById(questionId);
    if (!question) throw new NotFoundException('Question not found');

    const oldIndex = question.index;
    if (oldIndex === newIndex) return; // Không cần xử lý

    // 2️⃣ Xác định hướng di chuyển
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
}
