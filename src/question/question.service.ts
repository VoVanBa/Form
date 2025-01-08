import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AddQuestionDto } from './dtos/add.question.dto';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryUploadResult } from 'src/feedback/dtos/cloudinary.upload.result';
import { PrismaService } from 'src/config/prisma.service';
import { Prisma, QuestionType } from '@prisma/client';
import { AddAnswerOptionDto } from './dtos/add.answer.option.dto';
import { PrismaQuestionRepository } from 'src/repositories/prisma-question.repository';
import { PrismaFormRepository } from 'src/repositories/prisma-form.repository';
import { PrismaMediaRepository } from 'src/repositories/prisma-media.repository';
import { UpdateQuestionDto } from './dtos/update.question.dto';
import { defaultQuestionSettings } from 'src/config/default.question.settings';
import { PrismaAnswerOptionRepository } from 'src/repositories/prisma-anwser-option.repository';

@Injectable()
export class QuestionService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('CLOUDINARY') private readonly cloudinaryClient: typeof cloudinary,
    private prismaQuestionRepository: PrismaQuestionRepository,
    private prismaFormRepository: PrismaFormRepository,
    private prismaMediaRepository: PrismaMediaRepository,
    private prismaAnswerOptionRepository: PrismaAnswerOptionRepository,
  ) {}

  async deleteOptionAnwser(
    questionId: number,
    optionAnwerId: number,
    surveyFeedBackId: number,
  ) {
    const form = await this.prismaFormRepository.getFormById(surveyFeedBackId);
    if (!form) {
      throw new Error('surveyFeedBack not found');
    }
    const question =
      await this.prismaQuestionRepository.getQuessionById(questionId);
    if (!question) {
      throw new Error('question not found');
    }
    const answerOption = await this.prismaService.answerOption.delete({
      where: {
        questionId: question.id,
        id: optionAnwerId,
      },
    });

    return answerOption;
  }

  async getAllQuestion(formId: number) {
    return this.prismaQuestionRepository.findAllQuestion(formId);
  }

  async addAndUpdateQuestion(
    formId: number,
    updateQuestionDto: UpdateQuestionDto,
  ) {
    const form = await this.prismaFormRepository.getFormById(formId);

    if (!form) {
      throw new BadRequestException('form not found');
    }

    const { questionType, questionId } = updateQuestionDto;

    let handler;

    if (questionId) {
      const question =
        await this.prismaQuestionRepository.getQuessionById(questionId);

      if (!question) {
        throw new BadRequestException('Question not found');
      }

      if (questionType !== question.questionType) {
        await this.prismaQuestionRepository.deleteQuestionById(questionId);
        handler = this.getHandlerForQuestionType(questionType);
      } else {
        await this.updateQuestion(questionId, updateQuestionDto);

        return question;
      }
    } else {
      handler = this.getHandlerForQuestionType(questionType);
    }

    //   if (!handler) {
    //     throw new BadRequestException(
    //       Unsupportedquestiontype: ${questionType},
    //     );
    //   }

    return await handler(formId, updateQuestionDto);
  }

  private async updateQuestion(
    questionId: number,
    updateQuestionDto: UpdateQuestionDto,
  ) {
    const question = await this.prismaService.question.findFirst({
      where: { id: questionId },
    });

    if (!question) {
      throw new BadRequestException('Question not found');
    }

    const { answerOptions, imageId } = updateQuestionDto;
    if (updateQuestionDto.imageId) {
      const questionOnMedia =
        await this.prismaMediaRepository.getQuestionOnMediaByQuestionId(
          updateQuestionDto.questionId,
        );
      console.log(questionOnMedia, '12356');
      if (imageId && imageId != questionOnMedia.mediaId) {
        await this.updateQuestionImage(questionId, imageId);

        const questionOnMediaId =
          await this.prismaMediaRepository.getQuestionOnMediaByQuestionId(
            questionId,
          );
        await this.prismaMediaRepository.deleteMediaById(
          questionOnMediaId.mediaId,
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
    );

    await this.updateAnswerOptions(questionId, updateQuestionDto);

    return updatedQuestion;
  }

  private async updateAnswerOptions(
    questionId: number,
    updateQuestionDto: UpdateQuestionDto,
  ) {
    const answerOptionsId: number[] = [];

    console.log(answerOptionsId, '12345654');
    if (updateQuestionDto.answerOptions) {
      await Promise.all(
        updateQuestionDto.answerOptions.map(async (option) => {
          if (option.answerOptionId) {
            // Cập nhật answer option nếu đã tồn tại
            await this.prismaService.answerOption.update({
              where: { id: option.answerOptionId },
              data: {
                label: option.label,
                isActive: option.isActive,
                description: option.description,
              },
            });

            answerOptionsId.push(option.answerOptionId);

            // Cập nhật hình ảnh nếu có
            if (option.imageIds > 0) {
              await this.updateAnswerOptionImages(
                option.answerOptionId,
                option.imageIds,
              );
            }
          } else {
            // Lấy chỉ số hiện tại và tạo mới answer option
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

            if (option.imageIds) {
              const curentImageIds =
                await this.prismaMediaRepository.getAnswerOptionByAnswerOptionId(
                  createdOption.id,
                );

              await this.updateAnswerOptionImages(
                createdOption.id,
                option.imageIds,
              );
            }
          }
        }),
      );

      // Xóa các answer option không còn tồn tại
      await this.deleteRemovedAnswerOptions(questionId, answerOptionsId);
    }
  }

  private async deleteRemovedAnswerOptions(
    questionId: number,
    answerOptionsId: number[],
  ) {
    const answerOptionsInDb =
      await this.prismaAnswerOptionRepository.findanswerOptionsByQuestionId(
        questionId,
      );
    const answerOptionsIdInDbMap = answerOptionsInDb.map((option) => option.id);

    const idsToDelete = answerOptionsIdInDbMap.filter(
      (id) => !answerOptionsId.includes(id),
    );

    if (idsToDelete.length > 0) {
      await Promise.all(
        idsToDelete.map((index) =>
          this.prismaAnswerOptionRepository.deleteAnserOption(index),
        ),
      );

      // await this.prisma.answerOption.deleteMany({
      //   where: { id: { in: idsToDelete } },
      // });
    }
  }

  private async updateQuestionImage(questionId: number, imageId: number) {
    const existingImage =
      await this.prismaMediaRepository.getQuestionOnMediaByMediaId(imageId);

    if (!existingImage) {
      throw new BadRequestException(
        'Image not found or already associated with another question',
      );
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

  // Trong JavaScript, từ khóa bind(this) được sử dụng để ràng buộc ngữ cảnh (this) của một hàm về đối tượng cụ thể mà bạn muốn. Điều này đảm bảo rằng khi hàm được gọi, nó sẽ sử dụng ngữ cảnh this đúng như mong đợi.
  private getHandlerForQuestionType(questionType: QuestionType) {
    const handlers = {
      [QuestionType.SINGLE_CHOICE]: this.handleChoiceQuestion.bind(this),
      [QuestionType.MULTI_CHOICE]: this.handleChoiceQuestion.bind(this),
      [QuestionType.PICTURE_SELECTION]:
        this.handlePictureSelectionQuestion.bind(this),
      [QuestionType.INPUT_TEXT]: this.handleInputText.bind(this),
      [QuestionType.RATING_SCALE]: this.handleRating.bind(this),
    };

    return handlers[questionType];
  }

  private async handleRating(formId: number, addQuestionDto: AddQuestionDto) {
    const { imageId } = addQuestionDto;

    const question = await this.createQuestion(formId, addQuestionDto);

    if (imageId) {
      await this.updateQuestionImage(question.id, imageId);
    }

    return question;
  }

  private async handleInputText(
    formId: number,
    addQuestionDto: AddQuestionDto,
  ) {
    return await this.createQuestion(formId, addQuestionDto);
  }
  private async handleChoiceQuestion(
    formId: number,
    addQuestionDto: AddQuestionDto,
  ) {
    return await this.createQuestion(formId, addQuestionDto);
  }

  private async handlePictureSelectionQuestion(
    formId: number,
    addQuestionDto: AddQuestionDto,
  ) {
    await this.createQuestion(formId, addQuestionDto);
  }

  private async createQuestion(
    formId: number,
    addQuestionDto: AddQuestionDto,
    questionTypeOverride?: QuestionType,
  ) {
    const { headline, questionType, answerOptions, imageId } = addQuestionDto;

    const finalQuestionType = questionTypeOverride || questionType;

    const finalSettings = addQuestionDto.settings;

    console.log(finalSettings, 'finalSettings ');

    const index =
      await this.prismaQuestionRepository.getQuestionCountInForm(formId);

    const question = await this.prismaQuestionRepository.createQuestion(
      formId,
      addQuestionDto,
      index + 1,
    );

    await this.prismaQuestionRepository.createQuestionSettings(
      question.id,
      finalSettings,
      addQuestionDto.key,
    );

    // Cập nhật hình ảnh nếu cần
    if (imageId && finalQuestionType === QuestionType.PICTURE_SELECTION) {
      await this.updateQuestionImage(question.id, imageId);
    }

    // Tạo các tùy chọn trả lời
    if (answerOptions) {
      await this.createAnswerOptions(question.id, answerOptions);
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

    await Promise.all(
      answerOptions.map(async (option, idx) => {
        const newIndex = index + idx + 1;

        // Tạo AnswerOption mới cho câu hỏi với thứ tự đã tính toán
        const createdOption =
          await this.prismaAnswerOptionRepository.createAnswerOptions(
            questionId,
            option,
            newIndex, // Gửi index mới
          );

        // Kiểm tra và xử lý ảnh nếu có
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

    const answerOptionOnMediaData = mediaIds.map((mediaId) => ({
      mediaId,
      answerOptionId: null,
    }));

    // await this.prismaService.answerOptionOnMedia.createMany({
    //   data: answerOptionOnMediaData,
    // });

    await this.prismaMediaRepository.createAnswerOptionOnMedia(
      answerOptionOnMediaData,
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
    const mediaId = media.id;

    const questionOnMediaData = {
      mediaId: mediaId,
      questionId: null,
    };

    await this.prismaMediaRepository.createQuestionOnMedia(questionOnMediaData);

    // await this.prismaService.questionOnMedia.create({
    //   data: {
    //     media: {
    //       connect: { id: mediaId },
    //     },
    //   },
    // });

    return mediaId;
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
    const form = await this.prismaFormRepository.getFormById(formId);
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    const question =
      await this.prismaQuestionRepository.deleteQuestionById(questionId);
  }

  async createDefaultQuestionConfigByAdmin() {
    const promises = defaultQuestionSettings.map(({ key, settings }) =>
      this.prismaQuestionRepository.createDefaultQuestionConfigByAdmin(
        key,
        settings,
      ),
    );
  }

  async getSettingByQuestionType(type: QuestionType) {
    const setting =
      await this.prismaQuestionRepository.getSettingByQuestionType(type);
    return setting;
  }

  // async handleQuestionOrderUp(questionId: number) {
  //   const question = await this.prismaService.surveyOnQuestion.findFirst({
  //     where: {
  //       id: questionId,
  //     },
  //   });

  //   if (!question) {
  //     throw new NotFoundException('Question not found');
  //   }

  //   const order = question.sortOrder;
  //   if (order === 0) {
  //     return;
  //   }

  //   const prevQuestion = await this.prismaService.surveyOnQuestion.findFirst({
  //     where: {
  //       sortOrder: order - 1,
  //       formId: question.formId,
  //     },
  //   });

  //   if (!prevQuestion) {
  //     throw new NotFoundException('Previous question not found');
  //   }

  //   await this.prismaService.surveyOnQuestion.update({
  //     where: {
  //       id: prevQuestion.id,
  //     },
  //     data: {
  //       sortOrder: order,
  //     },
  //   });

  //   const currQuestion = await this.prismaService.surveyOnQuestion.update({
  //     where: {
  //       id: question.id,
  //     },
  //     data: {
  //       sortOrder: order - 1,
  //     },
  //   });

  //   return currQuestion;
  // }
  // async handleQuestionOrderDown(questionId: number) {
  //   const question = await this.prismaService.surveyOnQuestion.findFirst({
  //     where: {
  //       id: questionId,
  //     },
  //   });

  //   if (!question) {
  //     throw new NotFoundException('Question not found');
  //   }

  //   const order = question.sortOrder;

  //   const nextQuestion = await this.prismaService.surveyOnQuestion.findFirst({
  //     where: {
  //       sortOrder: order + 1,
  //       formId: question.formId,
  //     },
  //   });

  //   if (!nextQuestion) {
  //     throw new NotFoundException('Previous question not found');
  //   }

  //   await this.prismaService.surveyOnQuestion.update({
  //     where: {
  //       id: nextQuestion.id,
  //     },
  //     data: {
  //       sortOrder: order,
  //     },
  //   });

  //   const currQuestion = await this.prismaService.surveyOnQuestion.update({
  //     where: {
  //       id: question.id,
  //     },
  //     data: {
  //       sortOrder: order + 1,
  //     },
  //   });

  //   return currQuestion;
  // }
}
