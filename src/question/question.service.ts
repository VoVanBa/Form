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

@Injectable()
export class QuestionService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('CLOUDINARY') private readonly cloudinaryClient: typeof cloudinary,
    private prismaQuestionRepository: PrismaQuestionRepository,
    private prismaFormRepository: PrismaFormRepository,
    private prismaMediaRepository: PrismaMediaRepository,
  ) {}

  // async deleteOptionAnwser(
  //   questionId: number,
  //   optionAnwerId: number,
  //   businessId: number,
  // ) {
  //   const question = await this.prismaService.questionBusiness.findFirst({
  //     where: {
  //       questionId: questionId,
  //       businessId: businessId,
  //     },
  //   });
  //   if (!question) {
  //     throw new Error('question not found');
  //   }
  //   const answerOption = await this.prismaService.answerOption.delete({
  //     where: {
  //       questionId: question.id,
  //       id: optionAnwerId,
  //     },
  //   });

  //   return answerOption;
  // }

  async getAllQuestion(formId: number) {
    this.prismaQuestionRepository.findAllQuestion(formId);
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
        const { settings } = updateQuestionDto;
        await this.prismaQuestionRepository.updateQuestion(
          questionId,
          updateQuestionDto,
        );

        // await this.prismaQuestionRepository.updateQuestionSettings(
        //   questionId,
        //   settings,
        // );
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

    let questionOnMedia;
    if (updateQuestionDto.imageId) {
      questionOnMedia =
        await this.prismaQuestionRepository.getQuestionOnMediaById(
          updateQuestionDto.imageId,
        );
    }

    const { answerOptions, imageId } = updateQuestionDto;

    const updatedQuestion = await this.prismaQuestionRepository.updateQuestion(
      questionId,
      updateQuestionDto,
    );
    if (imageId && !questionOnMedia) {
      await this.updateQuestionImage(questionId, imageId);
    }

    // await this.updateAnswerOptions(questionId, answerOptions);

    return updatedQuestion;
  }

  // private async updateQuestionImage(questionId: number, imageId: number) {
  //   const existingImage =
  //     await this.prismaMediaRepository.getQuestionOnMediaByMediaId(imageId);

  //   // prisma.questionOnMedia.findFirst({
  //   //   where: { mediaId: imageId, questionId: null },
  //   // });

  //   if (!existingImage) {
  //     throw new BadRequestException(
  //       'Image not found or already associated with another question',
  //     );
  //   }

  //   await this.prismaMediaRepository.updateQuestionOnMedia(
  //     questionId,
  //     existingImage.id,
  //   );

  //   // questionOnMedia.update({
  //   //   where: { id: existingImage.id },
  //   //   data: { questionId },
  //   // });
  // }

  private async deleteRemovedAnswerOptions(
    tx: Prisma.TransactionClient,
    questionId: number,
    answerOptionsId: number[],
  ) {
    const answerOptionsInDb = await tx.answerOption.findMany({
      where: { questionId: questionId },
    });
    const answerOptionsIdInDbMap = answerOptionsInDb.map((option) => option.id);

    const idsToDelete = answerOptionsIdInDbMap.filter(
      (id) => !answerOptionsId.includes(id),
    );

    if (idsToDelete.length > 0) {
      await tx.answerOption.deleteMany({ where: { id: { in: idsToDelete } } });
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

  // private async updateAnswerOptionImages(
  //   answerOptionId: number,
  //   imageIds: number[],
  // ) {
  //   await Promise.all(
  //     imageIds.map(async (mediaId) => {
  //       await this.prisma.answerOptionOnMedia.updateMany({
  //         where: { mediaId },
  //         data: { answerOptionId },
  //       });
  //     }),
  //   );
  // }

  private async updateAnswerOptionImages(
    answerOptionId: number,
    imageIds: number[],
  ) {
    await Promise.all(
      imageIds.map(async (mediaId) => {
        await this.prismaMediaRepository.updateAnswerOptionOnMedia(
          mediaId,
          answerOptionId,
        );
      }),
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

    // const defaultConfig = DefaultQuestionSettings.getDefaultSettings(
    //   addQuestionDto.questionType,
    // );

    // const question = await this.prismaQuestionRepository.createQuestion(
    //   defaultConfig,
    //   formId,
    //   addQuestionDto,
    // );

    // if (imageId) {
    //   await this.updateQuestionImage(question.id, imageId);
    // }

    // return question;
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
    // const defaultConfig = DefaultQuestionSettings.getDefaultSettings(
    //   addQuestionDto.questionType,
    // );
    const index =
      await this.prismaQuestionRepository.getQuestionCountInForm(formId);
    const question = await this.prismaQuestionRepository.createQuestion(
      formId,
      addQuestionDto,
      index + 1,
    );
  }

  private async handlePictureSelectionQuestion(
    formId: number,
    addQuestionDto: AddQuestionDto,
  ) {
    // const defaultConfig = DefaultQuestionSettings.getDefaultSettings(
    //   addQuestionDto.questionType,
    // );
    // const question = await this.prismaQuestionRepository.createQuestion(
    //   defaultConfig,
    //   formId,
    //   addQuestionDto,
    // );
  }

  private async createQuestion(
    formId: number,
    addQuestionDto: AddQuestionDto,
    questionTypeOverride?: QuestionType,
  ) {
    const { headline, questionType, answerOptions, imageId } = addQuestionDto;

    const finalQuestionType = questionTypeOverride || questionType;

    // const defaultConfig =
    //   await this.prismaQuestionRepository.getSettingByQuestionType(
    //     addQuestionDto.key,
    //   );

    // console.log(defaultConfig, 'default ');

    const finalSettings = addQuestionDto.settings;

    console.log(finalSettings, 'finalSettings ');

    const index =
      await this.prismaQuestionRepository.getQuestionCountInForm(formId);

    // ------------------đang làm--------------

    // const setting = await this.prismaQuestionRepository.updateQuestionSettings(
    //   null,
    //   addQuestionDto.setting,
    // );
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
    // if (answerOptions) {
    //   await this.createAnswerOptions(question.id, answerOptions);
    // }

    return question;
  }

  // Tách logic tạo các tùy chọn trả lời
  private async createAnswerOptions(
    questionId: number,
    answerOptions: AddAnswerOptionDto[],
  ) {
    await Promise.all(
      answerOptions.map(async (option) => {
        const createdOption = await this.prismaService.answerOption.create({
          data: {
            questionId,
            label: option.label,
            isActive: option.isActive,
            sortOrder: option.sortOrder,
            isCorrect: option.isCorrect,
            description: option.description,
          },
        });

        if (option.imageIds && option.imageIds.length > 0) {
          await this.updateAnswerOptionImages(
            // this.prismaService,
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
      return this.prismaService.media.create({
        data: {
          url: result.secure_url,
          fileName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          createdAt: new Date(),
        },
      });
    });
    const media = await Promise.all(mediaPromises);
    const mediaIds = media.map((m) => m.id);

    const answerOptionOnMediaData = mediaIds.map((mediaId) => ({
      mediaId,
      answerOptionId: null,
    }));
    const saveAnserOption =
      await this.prismaService.answerOptionOnMedia.createMany({
        data: answerOptionOnMediaData,
      });

    return mediaIds;
  }
  async uploadImage(image: Express.Multer.File): Promise<number> {
    const result = await this.uploadImageToCloudinary(image);

    const media = await this.prismaService.media.create({
      data: {
        url: result.secure_url,
        fileName: image.originalname,
        mimeType: image.mimetype,
        size: image.size,
        createdAt: new Date(),
      },
    });

    const mediaId = media.id;

    const questionOnMediaData = {
      mediaId: mediaId,
      questionId: null,
    };

    await this.prismaService.questionOnMedia.create({
      data: {
        media: {
          connect: { id: mediaId },
        },
      },
    });

    // Trả về mediaId
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
    const media = await this.prismaService.media.delete({
      where: {
        id: mediaId,
      },
    });
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
