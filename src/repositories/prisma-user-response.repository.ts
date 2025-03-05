import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/config/providers/prisma.service';
import { UserOnResponse } from 'src/models/UserOnResponse';

@Injectable()
export class PrismaUserResponseRepository {
  constructor(private readonly prisma: PrismaService) {}

  public getPrisma(): PrismaClient {
    return this.prisma;
  }

  async create(
    formId: number,
    guest: any,
    userId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    return prisma.userOnResponse.create({
      data: {
        formId,
        guest,
        userId,
      },
    });
  }

  // async create(formId: number, guest: any, userId: number) {
  //   return this.prisma.userOnResponse.create({
  //     data: {
  //       formId,
  //       guest,
  //       userId,
  //     },
  //   });
  // }

  async findAllByFormId(formId: number) {
    return this.prisma.userOnResponse.findMany({
      where: {
        formId,
      },
    });
  }

  async getUserResponse(formId: number) {
    return this.prisma.userOnResponse.findMany({
      where: {
        formId: formId,
      },
    });
  }

  async getDetailResponsesByUsername(username: string | null, formId: number) {
    return this.prisma.userOnResponse.findMany({
      where: {
        formId: formId,
        ...(username ? { user: { username: { contains: username } } } : {}), // Nếu username không null thì lọc, ngược lại bỏ lọc
      },
      orderBy: {
        sentAt: 'desc',
      },
      include: {
        user: true,
        responseOnQuestions: {
          include: {
            question: {
              include: {
                answerOptions: {
                  include: {
                    answerOptionOnMedia: {
                      include: {
                        media: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }
  async getUserResponses(
    formId: number,
    startDate?: Date, // Receive preprocessed date filters from the service
    endDate?: Date,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    // Build dynamic filter
    const filter: any = { formId };

    if (startDate && endDate) {
      filter.sentAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Get total count based on filters
    const totalCount = await this.prisma.userOnResponse.count({
      where: filter,
    });

    // Fetch paginated data
    const data = await this.prisma.userOnResponse.findMany({
      where: filter,
      orderBy: { sentAt: 'desc' },
      take: limit,
      skip,
      include: {
        user: true,
        responseOnQuestions: {
          include: {
            question: {
              include: {
                answerOptions: {
                  include: {
                    answerOptionOnMedia: { include: { media: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      data,
      meta: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
    };
  }

  async filterResponsesByDateRange(
    formId: number,
    startDate: Date,
    endDate: Date,
    page: number = 1, // Default to page 1
    limit: number = 10, // Default to 10 items per page
  ) {
    const skip = (page - 1) * limit;

    // Total count of responses for the given filters
    const totalCount = await this.prisma.userOnResponse.count({
      where: {
        formId: formId,
        sentAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Fetch the data with pagination
    const data = await this.prisma.userOnResponse.findMany({
      where: {
        formId: formId,
        sentAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: true,
        responseOnQuestions: {
          include: {
            question: {
              include: {
                answerOptions: {
                  include: {
                    answerOptionOnMedia: { include: { media: true } },
                  },
                },
              },
            },
          },
        },
      },
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
    };
  }

  async getResponsesBySurveyAndUser(
    surveyId: number,
    userId?: number | null,
    sessionId?: string,
    tx?: any,
  ) {
    const prisma = tx || this.prisma;

    if (userId) {
      return await prisma.userOnResponse.findFirst({
        where: {
          formId: surveyId,
          userId: userId,
        },
        include: { responseOnQuestions: true },
      });
    }

    if (sessionId) {
      const allResponses = await prisma.userOnResponse.findMany({
        where: {
          formId: surveyId,
          guest: { not: null },
        },
        include: { responseOnQuestions: true },
      });

      for (const response of allResponses) {
        try {
          const guestData = response.guest;

          if (guestData && typeof guestData === 'object') {
            if (guestData.sessionId === sessionId) {
              return response;
            }
          }

          if (typeof guestData === 'string') {
            try {
              const parsedGuest = JSON.parse(guestData);
              if (parsedGuest.sessionId === sessionId) {
                return response;
              }
            } catch (parseError) {}
          }
        } catch (e) {
          console.error('❌ Lỗi không mong muốn khi xử lý guestData:', e);
        }
      }
    }

    return null;
  }

  async createSingleChoiceResponse(
    userResponseId: number,
    questionId: number,
    formId: number,
    answerOptionId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    return prisma.responseOnQuestion.create({
      data: {
        useronResponseId: userResponseId,
        questionId,
        formId,
        answerOptionId,
      },
    });
  }

  async createMultiChoiceResponse(
    userResponseId: number,
    questionId: number,
    formId: number,
    answerOptionId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    return prisma.responseOnQuestion.create({
      data: {
        useronResponseId: userResponseId,
        questionId,
        formId,
        answerOptionId,
      },
    });
  }

  async createTextResponse(
    userResponseId: number,
    questionId: number,
    formId: number,
    answerText: string,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    return prisma.responseOnQuestion.create({
      data: {
        useronResponseId: userResponseId,
        questionId,
        formId,
        answerText,
      },
    });
  }

  async createRatingResponse(
    userResponseId: number,
    questionId: number,
    formId: number,
    ratingValue: number,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    return prisma.responseOnQuestion.create({
      data: {
        useronResponseId: userResponseId,
        questionId,
        formId,
        ratingValue,
      },
    });
  }

  async createUserOnResponse(
    formId: number,
    userId: number | null,
    guest: any,
    tx?: Prisma.TransactionClient,
  ): Promise<UserOnResponse> {
    const prisma = tx || this.prisma;
    const data = await prisma.userOnResponse.create({
      data: {
        formId,
        userId,
        guest,
      },
    });
    return UserOnResponse.fromPrisma(data);
  }

  async createResponseSkiped(
    userResponseId: number,
    questionId: number,
    formId: number,
    skip: boolean,
    tx?: any,
  ) {
    const prisma = tx || this.prisma;
    const data = await prisma.responseOnQuestion.create({
      data: {
        useronResponseId: userResponseId,
        questionId,
        formId,
        skipped: skip,
      },
    });
  }

  async deleteExistingResponses(
    userResponseId: number,
    questionId: number,
    formId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    return prisma.responseOnQuestion.deleteMany({
      where: {
        useronResponseId: userResponseId,
        questionId,
        formId,
      },
    });
  }

  // Xóa câu trả lời hiện tại để quay lại câu hỏi trước
  async removeResponseForQuestion(
    formId: number,
    questionId: number,
    userResponseId: number,
    tx?: any,
  ) {
    const prisma = tx || this.prisma;
    return prisma.responseOnQuestion.deleteMany({
      where: {
        formId,
        questionId,
        useronResponseId: userResponseId,
      },
    });
  }
}
