import { PrismaService } from 'src/config/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class FeedbackResponseService {
  constructor(private readonly prisma: PrismaService) {}

  // async createFeedbackResponse(
  //   createFeedbackResponseDto: CreateFeedbackResponseDto,
  //   userId: number,
  // ) {
  //   const { feedbackFormId, questions, businessId } = createFeedbackResponseDto;

  //   const feedbackFormBusiness =
  //     await this.prisma.businessFeedbackForm.findFirst({
  //       where: { feedbackFormId: feedbackFormId, businessId: businessId },
  //     });

  //   if (!feedbackFormBusiness) {
  //     throw new NotFoundException('Feedback form not found');
  //   }

  //   const feedbackResponse = await this.prisma.formResponse.create({
  //     data: {
  //       userId,
  //       feedbackFormId,
  //       status: 'PENDING',
  //     },
  //   });

  //   const answerOptions = await Promise.all(
  //     questions.map((question) =>
  //       this.prisma.answerOption.create({
  //         data: {
  //           questionId: question.questionId,
  //           label: question.selectedAnswerText, // Assuming `label` is used for text answers
  //           value: question.ratingValue,
  //           formResponseId: feedbackResponse.id,
  //         },
  //       }),
  //     ),
  //   );

  //   return {
  //     message: 'Feedback response created successfully',
  //   };
  // }

  // async getFeedbackResponseById(feedbackFormId: number, businessId: number) {
  //   const feedbackFormBusiness =
  //     await this.prisma.businessFeedbackForm.findFirst({
  //       where: { feedbackFormId: feedbackFormId, businessId: businessId },
  //     });

  //   if (!feedbackFormBusiness) {
  //     throw new NotFoundException('Feedback form not found');
  //   }
  //   const formResponse = await this.prisma.formResponse.findMany({
  //     where: { feedbackFormId: feedbackFormBusiness.feedbackFormId },
  //     select: {
  //       user: {
  //         select: {
  //           username: true,
  //           email: true,
  //         },
  //       },
  //       answers: {
  //         select: {
  //           id: true,
  //           label: true,
  //           answerOptionOnMedia: {
  //             select: {
  //               media: {
  //                 select: {
  //                   url: true,
  //                 },
  //               },
  //             },
  //           },
  //           question: {
  //             select: {
  //               headline: true,
  //             },
  //           },
  //         },
  //       },
  //       textAnswers: true,
  //       status: true,
  //     },
  //   });
  //   return formResponse;
  // }
  // async updateFeedbackResponseStatus(
  //   feedbackResponseId: number,
  //   status: FeedbackStatus,
  // ) {
  //   const feedbackResponse = await this.prisma.formResponse.update({
  //     where: { id: feedbackResponseId },
  //     data: { status },
  //   });

  //   if (!feedbackResponse) {
  //     throw new NotFoundException('Feedback response not found');
  //   }

  //   return feedbackResponse;
  // }
}
