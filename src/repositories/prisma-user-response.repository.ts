import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { UserOnResponse } from 'src/models/UserOnResponse';
import { ResponseDto } from 'src/survey-feedback-data/dtos/response.dto';

@Injectable()
export class PrismaUserResponseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(formId: number, guest: any, userId: number) {
    return this.prisma.userOnResponse.create({
      data: {
        formId,
        guest,
        userId,
        completedAt: new Date(),
      },
    });
  }

  async update(id: number) {
    return this.prisma.userOnResponse.update({
      where: {
        id: id,
      },
      data: {
        completedAt: new Date(),
      },
    });
  }
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
  async getAllUserResponses(
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

  async getUserResponseByUserId(userId, formId): Promise<UserOnResponse> {
    const user = await this.prisma.userOnResponse.findFirst({
      where: {
        formId: formId,
        userId: userId,
      },
      include: { responseOnQuestions: true },
    });
    return user ? new UserOnResponse(user) : null;
  }

  async getUserResponseBySessionId(
    sessionId: string,
    formId: number,
  ): Promise<UserOnResponse> {
    const user = await this.prisma.userOnResponse.findFirst({
      where: {
        formId,
        guest: {
          equals: { sessionId },
        },
      },
      include: { responseOnQuestions: true },
    });

    return user ? new UserOnResponse(user) : null;
  }

  async createSingleChoiceResponse(
    userResponseId: number,
    questionId: number,
    formId: number,
    answerOptionId: number,
  ) {
    return this.prisma.responseOnQuestion.create({
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
  ) {
    return this.prisma.responseOnQuestion.create({
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
  ) {
    return this.prisma.responseOnQuestion.create({
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
  ) {
    return this.prisma.responseOnQuestion.create({
      data: {
        useronResponseId: userResponseId,
        questionId,
        formId,
        ratingValue,
      },
    });
  }

  async createOtherAnwserResponse(
    userResponseId: number,
    questionId: number,
    formId: number,
    otherAnswer: string,
  ) {
    return this.prisma.responseOnQuestion.create({
      data: {
        useronResponseId: userResponseId,
        questionId,
        formId,
        otherAnswer,
      },
    });
  }

  async createUserOnResponse(
    formId: number,
    userId: number | null,
    guest: any,
  ): Promise<UserOnResponse> {
    const data = await this.prisma.userOnResponse.create({
      data: {
        formId,
        userId,
        guest,
      },
    });
    return new UserOnResponse(data);
  }

  async createResponseSkiped(
    userResponseId: number,
    questionId: number,
    formId: number,
    skip: boolean,
  ) {
    const data = await this.prisma.responseOnQuestion.create({
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
  ) {
    return this.prisma.responseOnQuestion.delete({
      where: {
        id: userResponseId,
      },
    });
  }

  async updateExistingResponses(
    userResponseId: number,
    questionId: number,
    dto: ResponseDto,
  ) {
    return this.prisma.responseOnQuestion.update({
      where: {
        id: userResponseId,
        questionId,
      },
      data: {
        answerOptionId: Array.isArray(dto.answerOptionId)
          ? undefined
          : dto.answerOptionId,
        answerText: dto.answerText,
        ratingValue: dto.ratingValue,
        otherAnswer: dto.ortherAnswer,
      },
    });
  }

  // Xóa câu trả lời hiện tại để quay lại câu hỏi trước
  async removeResponseForQuestion(
    formId: number,
    questionId: number,
    userResponseId: number,
  ) {
    return this.prisma.responseOnQuestion.deleteMany({
      where: {
        formId,
        questionId,
        useronResponseId: userResponseId,
      },
    });
  }
}
