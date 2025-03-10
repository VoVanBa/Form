import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/config/providers/prisma.service';

@Injectable()
export class PrismaResponseQuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async totalResponses(formId: number) {
    return this.prisma.userOnResponse.count({
      where: {
        formId: formId,
      },
    });
  }
  async create(
    questionId: number,
    answerOptionId: number,
    userResponseId: number,
    answerText: string,
    ratingValue: number,
    formId: number,
    tx?: any,
  ) {
    const prisma = tx || this.prisma;
    return await prisma.responseOnQuestion.create({
      data: {
        useronResponseId: userResponseId,
        questionId: questionId,
        answerOptionId: answerOptionId,
        answerText: answerText,
        ratingValue: ratingValue,
        formId,
      },
    });
  }
  async getGroupedResponsesByOption(formId: number) {
    return this.prisma.responseOnQuestion.groupBy({
      by: ['answerOptionId'],
      where: { formId },
      _count: {
        answerOptionId: true,
      },
    });
  }

  async findDetailedResponses(formId: number) {
    return this.prisma.responseOnQuestion.findMany({
      where: { formId },
      include: {
        answerOption: {
          include: {
            answerOptionOnMedia: { include: { media: true } },
          },
        },
        question: {
          include: {
            questionOnMedia: { include: { media: true } },
          },
        },
      },
    });
  }

  async getAll(formId: number, startDate?: Date, endDate?: Date) {
    let filter: any = { formId };

    if (startDate && endDate) {
      filter.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }
    return await this.prisma.question.findMany({
      where: { ...filter, deletedAt: null },
      include: {
        questionOnMedia: {
          include: {
            media: true,
          },
        },
        answerOptions: {
          include: {
            answerOptionOnMedia: {
              include: {
                media: true,
              },
            },
          },
        },
        responseOnQuestions: true,
        businessQuestionConfiguration: {
          select: {
            settings: true,
          },
        },
      },
    });
  }

  async deleteResponsesForQuestions(
    surveyId: number,
    questionIds: number[],
    userId: number,
  ): Promise<void> {
    await this.prisma.responseOnQuestion.deleteMany({
      where: {
        formId: surveyId,
        questionId: {
          in: questionIds,
        },
        userResponse: {
          userId: userId,
        },
      },
    });
  }
}
