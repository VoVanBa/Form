import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import { SaveResponsesDto } from './dtos/save.responses.dto';

@Injectable()
export class ResponseService {
  constructor(private prisma: PrismaService) {}

  // async getSurveyResponseById(
  //   surveyId: number,
  //   businessId: number,
  // ): Promise<any> {
  //   console.log(surveyId, 'Fetching survey response');

  //   const businessSurveyResponses =
  //     await this.prisma.businessSurveyResponseQuestion.findMany({
  //       where: {
  //         businessId: businessId,
  //         surveyResponseQuestion: {
  //           surveyResponse: {
  //             surveyId: surveyId,
  //           },
  //         },
  //       },
  //       include: {
  //         surveyResponseQuestion: {
  //           include: {
  //             question: true,
  //             answerOption: true,
  //             surveyResponse: {
  //               select: {
  //                 user: true,
  //                 guest: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });

  //   if (!businessSurveyResponses || businessSurveyResponses.length === 0) {
  //     throw new BadRequestException('No responses found for this business');
  //   }

  //   const surveyResponseQuestions = businessSurveyResponses.map(
  //     (response) => response.surveyResponseQuestion,
  //   );

  //   console.log(
  //     businessSurveyResponses.map(
  //       (response) => response.surveyResponseQuestion.id,
  //     ),
  //     'surveyResponseQuestions',
  //   );

  //   return surveyResponseQuestions;
  // }

  // async saveGuestInfoAndResponsesAllowAnonymous(
  //   businessId: number,
  //   saveResponsesDto: SaveResponsesDto,
  // ) {
  //   const { surveyResponseId, guestInfo, responses } = saveResponsesDto;
  //   const guestInfoJson = JSON.stringify(guestInfo);

  //   const existingSurvey = await this.prisma.businessSurvey.findFirst({
  //     where: {
  //       surveyId: surveyResponseId,
  //       businessId,
  //     },
  //   });

  //   if (!existingSurvey) {
  //     throw new BadRequestException('Survey not found for this business');
  //   }

  //   const survey = await this.prisma.survey.findFirst({
  //     where: {
  //       id: existingSurvey.surveyId,
  //     },
  //   });

  //   if (!surveyResponseId) {
  //     throw new BadRequestException('Invalid survey response id');
  //   }

  //   const allowAnonymous = survey.allowAnonymous;

  //   if (!allowAnonymous && (!guestInfo.name || !guestInfo.email)) {
  //     throw new BadRequestException('Guest name and email are required');
  //   }

  //   const userSurveyResponse = await this.prisma.userSurveyResponse.create({
  //     data: {
  //       surveyId: surveyResponseId,
  //       guest: guestInfoJson,
  //     },
  //   });

  //   for (const response of responses) {
  //     const { questionId, answerOptionId, selectedAnswerText, ratingValue } =
  //       response;

  //     if (Array.isArray(answerOptionId)) {
  //       for (const optionId of answerOptionId) {
  //         const surveyResponseQuestion =
  //           await this.prisma.surveyResponseQuestion.create({
  //             data: {
  //               userSurveyResponseId: userSurveyResponse.id,
  //               questionId,
  //               answerOptionId: optionId,
  //               selectedAnswerText,
  //             },
  //           });

  //         await this.prisma.businessSurveyResponseQuestion.create({
  //           data: {
  //             businessId: businessId,
  //             surveyResponseQuestionId: surveyResponseQuestion.id,
  //           },
  //         });

  //         if (ratingValue) {
  //           await this.prisma.ratingResponse.create({
  //             data: {
  //               surveyResponseQuestionId: surveyResponseQuestion.id,
  //               ratingValue,
  //               questionId,
  //             },
  //           });
  //         }
  //       }
  //     } else {
  //       const surveyResponseQuestion =
  //         await this.prisma.surveyResponseQuestion.create({
  //           data: {
  //             userSurveyResponseId: userSurveyResponse.id,
  //             questionId,
  //             answerOptionId: answerOptionId ? answerOptionId : null,
  //             selectedAnswerText,
  //           },
  //         });

  //       await this.prisma.businessSurveyResponseQuestion.create({
  //         data: {
  //           businessId: businessId,
  //           surveyResponseQuestionId: surveyResponseQuestion.id,
  //         },
  //       });

  //       if (ratingValue) {
  //         await this.prisma.ratingResponse.create({
  //           data: {
  //             surveyResponseQuestionId: surveyResponseQuestion.id,
  //             ratingValue,
  //             questionId,
  //           },
  //         });
  //       }
  //     }
  //   }
  // }

  async saveGuestInfoAndResponsesNotAllowAnonymous(
    saveResponsesDto: SaveResponsesDto,
    userId: number,
    businessId: number,
  ) {
    const { surveyResponseId, guestInfo, responses } = saveResponsesDto;
    const guestInfoJson = JSON.stringify(guestInfo);

    if (!surveyResponseId) {
      throw new BadRequestException('Invalid survey response id');
    }

    const survey = await this.prisma.survey.findFirst({
      where: {
        id: existingSurvey.surveyId,
      },
    });

    const allowAnonymous = survey.allowAnonymous;

    if (!allowAnonymous && (!guestInfo.name || !guestInfo.email)) {
      throw new BadRequestException('Guest name and email are required');
    }

    const userSurveyResponse = await this.prisma.userSurveyResponse.create({
      data: {
        surveyId: surveyResponseId,
        userId,
        guest: guestInfoJson,
      },
    });

    for (const response of responses) {
      const { questionId, answerOptionId, selectedAnswerText, ratingValue } =
        response;

      if (Array.isArray(answerOptionId)) {
        for (const optionId of answerOptionId) {
          const surveyResponseQuestion =
            await this.prisma.formResponseQuestion.create({
              data: {
                userFormResponseId: userSurveyResponse.id,
                questionId,
                answerOptionId: optionId,
                selectedAnswerText,
              },
            });
        }
      } else {
        const surveyResponseQuestion =
          await this.prisma.formResponseQuestion.create({
            data: {
              userFormResponseId: userSurveyResponse.id,
              questionId,
              answerOptionId: answerOptionId ? answerOptionId[0] : null,
              selectedAnswerText,
            },
          });
      }
    }
  }

  // async userResponseBySurveyId(surveyId: number, businessId) {
  //   const existingSurveyBusiness = await this.prisma.businessSurvey.findFirst({
  //     where: {
  //       businessId: businessId,
  //       surveyId: surveyId,
  //     },
  //   });

  //   if (!existingSurveyBusiness) {
  //     throw new BadRequestException('Survey not found');
  //   }
  //   const survey = await this.prisma.survey.findFirst({
  //     where: {
  //       id: existingSurveyBusiness.surveyId,
  //     },
  //   });

  //   if (!survey) {
  //     throw new BadRequestException('Survey not found');
  //   }

  //   const surveyResponseQuestions =
  //     await this.prisma.userSurveyResponse.findMany({
  //       where: {
  //         surveyId: existingSurveyBusiness.surveyId,
  //       },
  //     });
  //   return surveyResponseQuestions;
  // }
  // async getRatioSurveyResponseByBusinessId(
  //   businessId: number,
  //   surveyId: number,
  // ): Promise<any> {
  //   console.log(businessId, surveyId, 'Fetching survey response ratio');

  //   const existingSurveyBusiness = await this.prisma.businessSurvey.findFirst({
  //     where: {
  //       businessId,
  //       surveyId,
  //     },
  //   });

  //   if (!existingSurveyBusiness) {
  //     throw new BadRequestException('Survey not found for this business');
  //   }

  //   // Tổng số phản hồi
  //   const totalResponses = await this.prisma.userSurveyResponse.count({
  //     where: {
  //       surveyId,
  //     },
  //   });

  //   if (totalResponses === 0) {
  //     throw new BadRequestException('No responses found for this survey');
  //   }

  //   // Thống kê số lượng lựa chọn cho từng câu trả lời
  //   const answerOptionCounts = await this.prisma.surveyResponseQuestion.groupBy(
  //     {
  //       by: ['answerOptionId'],
  //       where: {
  //         surveyResponse: {
  //           surveyId,
  //         },
  //       },
  //       _count: {
  //         answerOptionId: true,
  //       },
  //     },
  //   );

  //   const detailedResponses = await this.prisma.surveyResponseQuestion.findMany(
  //     {
  //       where: {
  //         surveyResponse: {
  //           surveyId,
  //         },
  //       },
  //       include: {
  //         answerOption: {
  //           include: {
  //             answerOptionOnMedia: {
  //               include: {
  //                 media: true,
  //               },
  //             },
  //           },
  //         },
  //         question: {
  //           include: {
  //             questionOnMedia: {
  //               include: {
  //                 media: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   );

  //   // Lấy tất cả các câu hỏi liên quan đến khảo sát
  //   const surveyQuestions = await this.prisma.surveyOnQuestion.findMany({
  //     where: {
  //       surveyId: surveyId,
  //     },
  //     select: {
  //       questionId: true,
  //     },
  //   });

  //   const questionIds = surveyQuestions.map((sq) => sq.questionId);

  //   const questions = await this.prisma.question.findMany({
  //     where: {
  //       id: {
  //         in: questionIds,
  //       },
  //     },
  //     include: {
  //       answerOptions: {
  //         include: {
  //           answerOptionOnMedia: {
  //             include: {
  //               media: true,
  //             },
  //           },
  //         },
  //       },
  //       questionOnMedia: {
  //         include: {
  //           media: true,
  //         },
  //       },
  //       surveyResponseQuestions: {
  //         select: {
  //           selectedAnswerText: true,
  //           ratingResponse: true,
  //         },
  //       },
  //       ratingConfiguration: true,
  //     },
  //   });

  //   const finalResponse = questions.map((question) => {
  //     const responses = [];

  //     // Tổng hợp số lượng cho từng lựa chọn câu trả lời
  //     let totalQuestionResponses = 0;

  //     question.answerOptions.forEach((answerOption) => {
  //       const countData = answerOptionCounts.find(
  //         (count) => count.answerOptionId === answerOption.id,
  //       );
  //       const count = countData ? countData._count.answerOptionId : 0;
  //       totalQuestionResponses += count;

  //       responses.push({
  //         id: answerOption.id,
  //         questionId: question.id,
  //         label: answerOption.label,
  //         count,
  //         percentage: 0, // Tạm thời để 0 ssẽ tính lại sau
  //         selectedAnswerText: null,
  //         mediaUrl:
  //           answerOption.answerOptionOnMedia.length > 0
  //             ? answerOption.answerOptionOnMedia[0].media.url
  //             : null,
  //       });
  //     });

  //     // Tổng hợp số lượng cho các câu trả lời văn bản và đánh giá
  //     const ratingCounts = question.ratingConfiguration?.range
  //       ? new Array(question.ratingConfiguration.range).fill(0)
  //       : [];

  //     question.surveyResponseQuestions.forEach((responseQuestion) => {
  //       if (responseQuestion.selectedAnswerText) {
  //         const existingResponse = responses.find(
  //           (response) =>
  //             response.selectedAnswerText ===
  //             responseQuestion.selectedAnswerText,
  //         );

  //         if (existingResponse) {
  //           existingResponse.count++;
  //         } else {
  //           responses.push({
  //             id: null,
  //             questionId: question.id,
  //             label: null,
  //             count: 1,
  //             percentage: 0, // Tạm thời để 0, sẽ tính lại sau
  //             selectedAnswerText: responseQuestion.selectedAnswerText,
  //             mediaUrl: null,
  //           });
  //         }
  //         totalQuestionResponses++;
  //       }

  //       if (
  //         responseQuestion.ratingResponse.length > 0 &&
  //         question.ratingConfiguration?.range
  //       ) {
  //         responseQuestion.ratingResponse.forEach((rating) => {
  //           if (
  //             rating.ratingValue >= 1 &&
  //             rating.ratingValue <= question.ratingConfiguration.range
  //           ) {
  //             ratingCounts[rating.ratingValue - 1]++;
  //             totalQuestionResponses++;
  //           }
  //         });
  //       }
  //     });

  //     if (question.ratingConfiguration?.range) {
  //       for (let i = 0; i < question.ratingConfiguration.range; i++) {
  //         const count = ratingCounts[i];
  //         responses.push({
  //           id: null,
  //           questionId: question.id,
  //           label: `Rating: ${i + 1}`,
  //           count,
  //           percentage: 0, // Tạm thời để 0, sẽ tính lại sau
  //           selectedAnswerText: null,
  //           mediaUrl: null,
  //         });
  //       }
  //     }

  //     // Tính lại phần trăm cho từng câu trả lời
  //     responses.forEach((response) => {
  //       response.percentage = (response.count / totalQuestionResponses) * 100;
  //     });

  //     return {
  //       questionId: question.id,
  //       headline: question.headline,
  //       mediaUrl:
  //         question.questionOnMedia.length > 0
  //           ? question.questionOnMedia[0].media.url
  //           : null,
  //       responses,
  //     };
  //   });

  //   // Trả về kết quả
  //   return {
  //     totalResponses,
  //     questions: finalResponse,
  //   };
  // }
}
