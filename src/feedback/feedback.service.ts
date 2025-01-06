import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import { Prisma, QuestionType } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryUploadResult } from './dtos/cloudinary.upload.result';
import { MailService } from 'src/mail/mail.service';
import { UsersService } from 'src/users/users.service';
import { CreateFeedbackTemplateDto } from './dtos/create.feedback.template.dto';
import { CreateFeedbackFormDto } from './dtos/create.feedback.form.dto';
import { AddFeedbackDto } from './dtos/add.feedback.dto';
import { AddAnswerOptionDto } from './dtos/add.answer.option.dto';

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    @Inject('CLOUDINARY') private readonly cloudinaryClient: typeof cloudinary,
    private mailService: MailService,
    private userService: UsersService,
    private prismaService: PrismaService,
  ) {}

  // async createFeedbackTemplateByAdmin(
  //   createFeedbackTemplateDto: CreateFeedbackTemplateDto,
  // ) {
  //   // Tạo biểu mẫu phản hồi mẫu
  //   const newFeedbackTemplate = await this.prisma.feedbackForm.create({
  //     data: {
  //       title: createFeedbackTemplateDto.title,
  //       description: createFeedbackTemplateDto.description,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //       isTemplate: true,
  //       feedbackFormOnQuestions: {
  //         create: createFeedbackTemplateDto.feedbackOnQuestions.map(
  //           (feedbackOnQuestion, questionIndex) => ({
  //             question: {
  //               create: {
  //                 headline: feedbackOnQuestion.headline,
  //                 required: feedbackOnQuestion.required,
  //                 questionType: feedbackOnQuestion.questionType,
  //                 answerOptions: {
  //                   create:
  //                     feedbackOnQuestion.answerOptions?.map((option) => ({
  //                       label: option.label,
  //                       value: option.value ?? null,
  //                       isActive: option.isActive ?? true,
  //                       sortOrder: option.sortOrder ?? 1,
  //                       isCorrect: option.isCorrect ?? false,
  //                       description: option.description ?? null,
  //                     })) ?? [],
  //                 },
  //               },
  //             },
  //           }),
  //         ),
  //       },
  //     },
  //     include: {
  //       feedbackFormOnQuestions: {
  //         include: {
  //           question: {
  //             include: {
  //               answerOptions: true,
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });

  //   return newFeedbackTemplate;
  // }
  // async createFeedbackFormByBusiness(
  //   createFeedbackFormDto: CreateFeedbackFormDto,
  //   businessId: number,
  //   userId: number,
  // ) {
  //   const business = await this.prisma.business.findUnique({
  //     where: { id: businessId },
  //   });
  //   if (!business) {
  //     throw new BadRequestException('Business ID không tồn tại');
  //   }

  //   const newFeedbackForm = await this.prisma.feedbackForm.create({
  //     data: {
  //       title: createFeedbackFormDto.title,
  //       userId: userId,
  //       description: createFeedbackFormDto.description,
  //       isTemplate: false,
  //     },
  //     include: {
  //       feedbackFormOnQuestions: true,
  //     },
  //   });

  //   await this.prisma.businessFeedbackForm.create({
  //     data: {
  //       businessId,
  //       feedbackFormId: newFeedbackForm.id,
  //     },
  //   });

  //   return newFeedbackForm;
  // }

  // private getHandlerForFeedbackType(feedbackType: QuestionType) {
  //   const handlers = {
  //     [QuestionType.SINGLE_CHOICE]: this.handleChoiceFeedback.bind(this),
  //     [QuestionType.MULTI_CHOICE]: this.handleChoiceFeedback.bind(this),
  //     [QuestionType.PICTURE_SELECTION]:
  //       this.handlePictureSelectionFeedback.bind(this),
  //     // [QuestionType.INPUT_TEXT]: this.handleTextFeedback.bind(this),
  //     // [QuestionType.RATING_SCALE]: this.handleRatingFeedback.bind(this),
  //   };

  //   return handlers[feedbackType];
  // }

  // async addAndUpdateFeedback(
  //   feedbackFormId: number,
  //   addFeedbackDto: AddFeedbackDto,
  // ) {
  //   const feedbackForm = await this.prisma.feedbackForm.findFirst({
  //     where: { id: feedbackFormId, userId: addFeedbackDto.userId },
  //   });

  //   if (!feedbackForm) {
  //     throw new BadRequestException('Feedback form not found');
  //   }

  //   const { questionType, questionId } = addFeedbackDto;

  //   let handler;

  //   if (questionId) {
  //     const feedbackFormOnQuestion =
  //       await this.prisma.feedbackFormOnQuestion.findFirst({
  //         where: {
  //           feedbackFormId: feedbackFormId,
  //           questionId: questionId,
  //         },
  //       });

  //     if (!feedbackFormOnQuestion) {
  //       throw new BadRequestException(
  //         'Question not found in feedback form context',
  //       );
  //     }

  //     const question = await this.prisma.question.findFirst({
  //       where: { id: feedbackFormOnQuestion.questionId },
  //     });

  //     if (!question) {
  //       throw new BadRequestException('Question not found');
  //     }

  //     if (questionType !== question.questionType) {
  //       await this.deleteQuestionById(questionId);
  //       handler = this.getHandlerForFeedbackType(questionType);
  //     } else {
  //       return await this.updateQuestion(questionId, addFeedbackDto);
  //     }
  //   } else {
  //     handler = this.getHandlerForFeedbackType(questionType);
  //   }

  //   if (!handler) {
  //     throw new BadRequestException(
  //       `Unsupported question type: ${questionType}`,
  //     );
  //   }

  //   return await handler(feedbackFormId, addFeedbackDto);
  // }

  // private async handleChoiceFeedback(
  //   feedbackFormId: number,
  //   addFeedbackDto: AddFeedbackDto,
  // ) {
  //   return await this.createFeedback(feedbackFormId, addFeedbackDto);
  // }

  // private async handlePictureSelectionFeedback(
  //   feedbackFormId: number,
  //   addFeedbackDto: AddFeedbackDto,
  // ) {
  //   return await this.createFeedback(
  //     feedbackFormId,
  //     addFeedbackDto,
  //     QuestionType.PICTURE_SELECTION,
  //   );
  // }

  // private async handleTextFeedback(
  //   feedbackFormId: number,
  //   addFeedbackDto: AddFeedbackDto,
  // ) {
  //   return await this.createFeedback(feedbackFormId, addFeedbackDto);
  // }

  // private async handleRatingFeedback(
  //   feedbackFormId: number,
  //   addFeedbackDto: AddFeedbackDto,
  // ) {
  //   return await this.createFeedback(feedbackFormId, addFeedbackDto);
  // }

  // private async createFeedback(
  //   feedbackFormId: number,
  //   addFeedbackDto: AddFeedbackDto,
  //   feedbackTypeOverride?: QuestionType,
  // ) {
  //   const {
  //     headline,
  //     description,
  //     questionType,
  //     answerOptions,
  //     imageId,
  //     businessId,
  //   } = addFeedbackDto;

  //   const finalFeedbackType = feedbackTypeOverride || questionType;

  //   const lastEntity = await this.prisma.feedbackFormOnQuestion.findFirst({
  //     where: { feedbackFormId },
  //     orderBy: { id: 'desc' },
  //   });

  //   const order = lastEntity ? lastEntity.id + 1 : 1;

  //   const question = await this.prisma.question.create({
  //     data: {
  //       headline: headline,
  //       required: true,
  //       questionType: finalFeedbackType,
  //       feedbackFormOnQuestions: {
  //         create: {
  //           feedbackFormId,
  //         },
  //       },
  //       questionBusiness: {
  //         create: {
  //           businessId,
  //         },
  //       },
  //     },
  //   });

  //   if (imageId && finalFeedbackType === QuestionType.PICTURE_SELECTION) {
  //     await this.updateQuestionImage(this.prisma, question.id, imageId);
  //   }

  //   if (answerOptions) {
  //     await this.createAnswerOptions(question.id, answerOptions);
  //   }

  //   return question;
  // }

  // private async updateQuestion(
  //   questionId: number,
  //   addFeedbackDto: AddFeedbackDto,
  // ) {
  //   const { headline, required, questionType, answerOptions, imageId } =
  //     addFeedbackDto;

  //   const question = await this.prisma.question.update({
  //     where: { id: questionId },
  //     data: {
  //       headline: headline,
  //       required,
  //       questionType,
  //     },
  //   });

  //   if (imageId && questionType === QuestionType.PICTURE_SELECTION) {
  //     await this.updateQuestionImage(this.prisma, question.id, imageId);
  //   }

  //   if (answerOptions) {
  //     await this.updateAnswerOptions(question.id, answerOptions);
  //   }

  //   return question;
  // }

  // private async deleteQuestionById(questionId: number) {
  //   await this.prisma.feedbackFormOnQuestion.deleteMany({
  //     where: { questionId },
  //   });

  //   await this.prisma.question.delete({
  //     where: { id: questionId },
  //   });
  // }

  // private async createAnswerOptions(
  //   questionId: number,
  //   answerOptions: AddAnswerOptionDto[],
  // ) {
  //   await Promise.all(
  //     answerOptions.map(async (option) => {
  //       const createdOption = await this.prisma.answerOption.create({
  //         data: {
  //           questionId,
  //           label: option.label,
  //           value: option.value,
  //           isActive: option.isActive,
  //           sortOrder: option.sortOrder,
  //           isCorrect: option.isCorrect,
  //           description: option.description,
  //         },
  //       });

  //       if (option.imageIds && option.imageIds.length > 0) {
  //         await this.updateAnswerOptionImages(
  //           this.prisma,
  //           createdOption.id,
  //           option.imageIds,
  //         );
  //       }
  //     }),
  //   );
  // }

  // private async updateAnswerOptions(
  //   questionId: number,
  //   answerOptions: AddAnswerOptionDto[],
  // ) {
  //   await this.prisma.answerOption.deleteMany({
  //     where: { questionId },
  //   });

  //   await this.createAnswerOptions(questionId, answerOptions);
  // }
  // private async updateQuestionImage(
  //   tx: Prisma.TransactionClient,
  //   questionId: number,
  //   imageId: number,
  // ) {
  //   const existingImage = await tx.questionOnMedia.findFirst({
  //     where: { mediaId: imageId, questionId: null },
  //   });

  //   if (!existingImage) {
  //     throw new BadRequestException(
  //       'Image not found or already associated with another question',
  //     );
  //   }

  //   await tx.questionOnMedia.update({
  //     where: { id: existingImage.id },
  //     data: { questionId },
  //   });
  // }

  // private async updateAnswerOptionImages(
  //   tx: Prisma.TransactionClient,
  //   answerOptionId: number,
  //   imageIds: number[],
  // ) {
  //   await Promise.all(
  //     imageIds.map(async (mediaId) => {
  //       await tx.answerOptionOnMedia.updateMany({
  //         where: { mediaId },
  //         data: { answerOptionId },
  //       });
  //     }),
  //   );
  // }

  // private async uploadImageToCloudinary(
  //   file: Express.Multer.File,
  // ): Promise<CloudinaryUploadResult> {
  //   return new Promise((resolve, reject) => {
  //     cloudinary.uploader
  //       .upload_stream({ resource_type: 'image' }, (error, result) => {
  //         if (error) {
  //           reject(error);
  //         } else {
  //           resolve(result as CloudinaryUploadResult);
  //         }
  //       })
  //       .end(file.buffer);
  //   });
  // }

  // async getFeedbackFormById(feedbackFormId: number) {
  //   return await this.prisma.feedbackForm.findFirst({
  //     where: { id: feedbackFormId },
  //     include: {
  //       feedbackFormOnQuestions: {
  //         include: {
  //           question: {
  //             include: {
  //               questionOnMedia: {
  //                 select: {
  //                   media: {
  //                     select: {
  //                       id: true,
  //                       url: true,
  //                     },
  //                   },
  //                 },
  //               },
  //               answerOptions: true,
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });
  // }

  // async sendFeedback(
  //   userId: number,
  //   createFeedbackDto: FeedbackDto,
  //   businessId: number,
  // ) {
  //   const feedback = await this.prisma.feedbackForm.create({
  //     data: {
  //       userId: userId,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //       businessId: businessId,
  //       feedbackFormOnQuestions: {
  //         create: createFeedbackDto.questions.map((question) => ({
  //           questionId: question.questionId,
  //           answer: question.answer,
  //         })),
  //       },
  //     },
  //   });
  //   if (createFeedbackDto.mediaIds && createFeedbackDto.mediaIds.length > 0) {
  //     await this.prisma.feedbackOnMedia.createMany({
  //       data: createFeedbackDto.mediaIds.map((mediaId) => ({
  //         mediaId,
  //         feedbackFormId: feedback.id,
  //       })),
  //     });
  //   }

  //   const user = await this.userService.getUserById(userId);
  //   await this.mailService.sendAtutoFeedbackReplyToCustomer(
  //     user.email,
  //     user.username,
  //   );
  //   return feedback;
  // }
  // async deleteMedia(mediaIds: number[]): Promise<void> {
  //   const unlinkedMedia = await this.prisma.media.findMany({
  //     where: {
  //       id: { in: mediaIds },
  //       feedbackId: null,
  //     },
  //   });
  //   for (const media of unlinkedMedia) {
  //     await this.prisma.media.delete({
  //       where: { id: media.id },
  //     });
  //   }
  // }
  // async updateFeedbackStatus(feedbackId: number, status: FeedbackStatus) {
  //   try {
  //     const feedback = await this.prisma.feedbackForm.update({
  //       where: {
  //         id: feedbackId,
  //       },
  //       data: {
  //         status,
  //       },
  //     });
  //     return feedback;
  //   } catch (error) {
  //     throw new Error(`Error creating feedback: ${error.message}`);
  //   }
  // }
  // async getAllAndFindFeedBack(
  //   page: number,
  //   limit: number,
  //   key: string,
  //   businessId: number,
  // ) {
  //   try {
  //     const skip = (page - 1) * limit;
  //     let feedback;
  //     if (!key) {
  //       feedback = await this.prisma.feedback.findMany({
  //         where: {
  //           businessId: businessId,
  //         },
  //         select: {
  //           feedbackType: {
  //             select: {
  //               typeName: true,
  //             },
  //           },
  //           comment: true,
  //           status: true,
  //           media: {
  //             select: {
  //               id: true,
  //               url: true,
  //             },
  //           },
  //           user: {
  //             select: {
  //               username: true,
  //               email: true,
  //             },
  //           },
  //         },
  //         orderBy: {
  //           id: 'desc',
  //         },
  //         skip,
  //         take: limit,
  //       });
  //     } else {
  //       feedback = await this.prisma.feedback.findMany({
  //         where: {
  //           businessId: businessId,
  //           OR: [
  //             {
  //               user: {
  //                 username: {
  //                   contains: key,
  //                 },
  //               },
  //             },
  //             {
  //               user: {
  //                 email: {
  //                   contains: key,
  //                 },
  //               },
  //             },
  //             {
  //               feedbackType: {
  //                 typeName: {
  //                   contains: key,
  //                 },
  //               },
  //             },
  //           ],
  //         },
  //         select: {
  //           id: true,
  //           comment: true,
  //           status: true,
  //           feedbackType: {
  //             select: {
  //               typeName: true,
  //             },
  //           },
  //           media: {
  //             select: {
  //               id: true,
  //               url: true,
  //             },
  //           },
  //           user: {
  //             select: {
  //               username: true,
  //               email: true,
  //             },
  //           },
  //         },
  //         skip,
  //         take: limit,
  //         orderBy: {
  //           id: 'desc',
  //         },
  //       });
  //     }
  //     const total = key
  //       ? await this.prisma.feedback.count({
  //           where: {
  //             businessId: businessId,
  //             AND: [
  //               {
  //                 user: {
  //                   username: {
  //                     contains: key,
  //                   },
  //                 },
  //               },
  //               {
  //                 user: {
  //                   email: {
  //                     contains: key,
  //                   },
  //                 },
  //               },
  //             ],
  //           },
  //         })
  //       : await this.prisma.feedback.count({
  //           where: {
  //             businessId: businessId,
  //           },
  //         });
  //     return {
  //       data: feedback,
  //       meta: {
  //         total,
  //         page,
  //         limit,
  //         totalPages: Math.ceil(total / limit),
  //       },
  //     };
  //   } catch (error) {
  //     throw new Error(`Error fetching feedback: ${error.message}`);
  //   }
  // }
  // async uploadImages(feedbackId: number, files: Express.Multer.File[]) {
  //   try {
  //     const uploadResults = await Promise.all(
  //       files.map((file) => this.uploadImageToCloudinary(file)),
  //     );
  //     const media = uploadResults.map((result, index) => {
  //       const file = files[index];
  //       const extension = file.originalname.split('.').pop() || 'unknown';
  //       return {
  //         url: result.secure_url,
  //         fileName: file.originalname,
  //         mimeType: file.mimetype,
  //         extension,
  //         size: file.size,
  //         feedbackId,
  //       };
  //     });
  //     return this.prisma.media.createMany({
  //       data: media,
  //     });
  //   } catch (error) {
  //     throw new Error(`Error uploading images: ${error.message}`);
  //   }
  // }
  // async getFeedBackType(businessId: number) {
  //   return this.prisma.feedbackType.findMany({
  //     where: {
  //       businessId: businessId,
  //     },
  //     select: {
  //       id: true,
  //       typeName: true,
  //     },
  //   });
  // }
  // async getQuantityFeedback() {
  //   return this.prisma.feedback.count();
  // }
  // async createFeedBackType(
  //   createFeedBackType: CreateFeedBackType,
  //   businessId: number,
  // ) {
  //   return this.prisma.feedbackType.create({
  //     data: {
  //       typeName: createFeedBackType.typeName,
  //       business: {
  //         connect: { id: businessId },
  //       },
  //     },
  //   });
  // }
}
