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
import { PrismasurveyFeedbackRepository } from 'src/repositories/prisma-survey-feeback.repository';
import { I18nService } from 'nestjs-i18n';
import { CloudinaryUploadResult } from './dtos/cloudinary.upload.result';
import { PrismaService } from 'src/config/prisma.service';
import { defaultQuestionSettings } from 'src/config/default.question.settings';
import { QuestionType } from 'src/models/enums/QuestionType';

@Injectable()
export class QuestionService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('CLOUDINARY') private readonly cloudinaryClient: typeof cloudinary,
    private prismaQuestionRepository: PrismaQuestionRepository,
    private prismaSurveuFeedBackRepository: PrismasurveyFeedbackRepository,
    private prismaMediaRepository: PrismaMediaRepository,
    private prismaAnswerOptionRepository: PrismaAnswerOptionRepository,
    private readonly i18n: I18nService,
  ) {}

  private async validateForm(formId: number) {
    const form =
      await this.prismaSurveuFeedBackRepository.getsurveyFeedbackById(formId);
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
  ) {
    await this.validateForm(formId);

    // Lấy max index hiện tại
    const currentMaxIndex =
      await this.prismaQuestionRepository.getMaxQuestionIndex(formId);

    let nextIndex = currentMaxIndex + 1;

    // Xử lý tuần tự để đảm bảo index đúng thứ tự
    const results = [];
    for (const updateQuestionDto of updateQuestionsDto) {
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

    if (updateQuestionDto.imageId) {
      const questionOnMedia =
        await this.prismaMediaRepository.getQuestionOnMediaByQuestionId(
          questionId,
        );
      if (updateQuestionDto.imageId !== questionOnMedia.mediaId) {
        await this.updateQuestionImage(questionId, updateQuestionDto.imageId);
        await this.prismaMediaRepository.deleteMediaById(
          questionOnMedia.mediaId,
        );
      }
    }

    const updatedQuestion = await this.prismaQuestionRepository.updateQuestion(
      questionId,
      updateQuestionDto,
    );
    await this.prismaQuestionRepository.updateQuestionSetting(
      questionId,
      updateQuestionDto.settings,
      formId,
    );
    await this.updateAnswerOptions(questionId, updateQuestionDto);

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
            await this.prismaAnswerOptionRepository.updateAnswerOptions(
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
              await this.prismaAnswerOptionRepository.getQuantityAnserOptionbyQuestionId(
                questionId,
              );
            const createdOption =
              await this.prismaAnswerOptionRepository.createAnswerOptions(
                questionId,
                option,
                index,
              );
            answerOptionsId.push(createdOption.id);
            if (
              updateQuestionDto.questionType === QuestionType.PICTURE_SELECTION
            ) {
              if (option.imageIds) {
                await this.updateAnswerOptionImages(
                  createdOption.id,
                  option.imageIds,
                );
              }
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
      await this.prismaAnswerOptionRepository.findanswerOptionsByQuestionId(
        questionId,
      );
    const idsToDelete = answerOptionsInDb
      .filter((option) => !answerOptionsId.includes(option.id))
      .map((option) => option.id);

    if (idsToDelete.length > 0) {
      await Promise.all(
        idsToDelete.map((id) =>
          this.prismaAnswerOptionRepository.deleteAnserOption(id, questionId),
        ),
      );
    }
  }

  private async updateQuestionImage(questionId: number, imageId: number) {
    const existingImage =
      await this.prismaMediaRepository.getQuestionOnMediaByMediaId(imageId);
    if (!existingImage) {
      throw new NotFoundException(this.i18n.translate('errors.IMAGENOTFOUND'));
    }
    await this.prismaMediaRepository.updateQuestionOnMedia(
      questionId,
      existingImage.id,
    );
  }

  private async updateAnswerOptionImages(
    answerOptionId: number,
    imageIds: number,
  ) {
    await this.prismaMediaRepository.updateAnswerOptionOnMedia(
      imageIds,
      answerOptionId,
    );
  }

  private getHandlerForQuestionType = (questionType: QuestionType) => {
    const handlers = {
      [QuestionType.SINGLE_CHOICE]: this.handleChoiceQuestion,
      [QuestionType.MULTI_CHOICE]: this.handleChoiceQuestion,
      [QuestionType.PICTURE_SELECTION]: this.handlePictureSelectionQuestion,
      [QuestionType.INPUT_TEXT]: this.handleInputText,
      [QuestionType.RATING_SCALE]: this.handleRating,
    };
    return handlers[questionType];
  };

  private handleRating = async (
    formId: number,
    addQuestionDto: AddQuestionDto,
    sortOrder: number,
  ) => {
    return this.createQuestion(formId, addQuestionDto, sortOrder);
  };

  private handleInputText = async (
    formId: number,
    addQuestionDto: AddQuestionDto,
    sortOrder: number,
  ) => {
    return this.createQuestion(formId, addQuestionDto, sortOrder);
  };

  private handleChoiceQuestion = async (
    formId: number,
    addQuestionDto: AddQuestionDto,
    sortOrder: number,
  ) => {
    return this.createQuestion(formId, addQuestionDto, sortOrder);
  };

  private handlePictureSelectionQuestion = async (
    formId: number,
    addQuestionDto: AddQuestionDto,
  ) => {
    const sortOrder =
      (await this.prismaQuestionRepository.getMaxQuestionIndex(formId)) + 1;
    return this.createQuestion(formId, addQuestionDto);
  };

  private async createQuestion(
    formId: number,
    addQuestionDto: AddQuestionDto,
    sortOrder?: number, // Làm sortOrder optional để backward compatible
  ) {
    const { answerOptions, imageId } = addQuestionDto;

    if (answerOptions && answerOptions.length < 2) {
      throw new BadRequestException(
        this.i18n.translate('errors.MUSTHAVEATLEASTTWOCHOICES'),
      );
    }

    // Sử dụng sortOrder được truyền vào nếu có
    const questionIndex =
      sortOrder ||
      (await this.prismaQuestionRepository.getMaxQuestionIndex(formId)) + 1;

    const question = await this.prismaQuestionRepository.createQuestion(
      formId,
      addQuestionDto,
      questionIndex,
    );

    // Phần còn lại giữ nguyên
    if (answerOptions) {
      await this.createAnswerOptions(question.id, answerOptions);
    }

    await this.prismaQuestionRepository.createQuestionSettings(
      question.id,
      addQuestionDto.settings,
      addQuestionDto.questionType,
      formId,
    );

    if (addQuestionDto.questionType === QuestionType.PICTURE_SELECTION) {
      await this.updateQuestionImage(question.id, imageId);
    }

    return question;
  }

  private async createAnswerOptions(
    questionId: number,
    answerOptions: AddAnswerOptionDto[],
  ) {
    const index =
      await this.prismaAnswerOptionRepository.getQuantityAnserOptionbyQuestionId(
        questionId,
      );
    const data = await Promise.all(
      answerOptions.map(async (option, idx) => {
        const newIndex = index + idx + 1;
        const createdOption =
          await this.prismaAnswerOptionRepository.createAnswerOptions(
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

  async handleQuestionOrderUp(questionId: number, formId: number) {
    await this.validateForm(formId);
    const questions = await this.getAllQuestion(formId);
    const questionIndex = questions.findIndex((q) => q.id === questionId);
    if (questionIndex === -1) {
      throw new NotFoundException(
        this.i18n.translate('errors.QUESTIONNOTFOUND'),
      );
    }
    const prevQuestion = questions[questionIndex - 1];
    if (!prevQuestion) {
      return { message: this.i18n.translate('errors.ALREADYATTOP') };
    }
    await this.swapQuestionIndexes(questionId, prevQuestion.id);
    return { message: this.i18n.translate('messages.QUESTIONMOVEDUP') };
  }

  async handleQuestionOrderDown(questionId: number, formId: number) {
    await this.validateForm(formId);
    const questions = await this.getAllQuestion(formId);
    const questionIndex = questions.findIndex((q) => q.id === questionId);
    if (questionIndex === -1) {
      throw new NotFoundException(
        this.i18n.translate('errors.QUESTIONNOTFOUND'),
      );
    }
    const nextQuestion = questions[questionIndex + 1];
    if (!nextQuestion) {
      return { message: this.i18n.translate('errors.QUESTIONMOVEDDOWN') };
    }
    await this.swapQuestionIndexes(questionId, nextQuestion.id);
    return { message: this.i18n.translate('messages.QUESTIONMOVEDDOWN') };
  }

  private async swapQuestionIndexes(questionId1: number, questionId2: number) {
    const question1 =
      await this.prismaQuestionRepository.getQuessionById(questionId1);
    const question2 =
      await this.prismaQuestionRepository.getQuessionById(questionId2);
    await Promise.all([
      this.prismaQuestionRepository.updateIndexQuestion(
        questionId1,
        question2.index,
      ),
      this.prismaQuestionRepository.updateIndexQuestion(
        questionId2,
        question1.index,
      ),
    ]);
  }
}
