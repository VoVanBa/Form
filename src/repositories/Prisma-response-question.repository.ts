import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/helper/providers/prisma.service';

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
  ) {
    return await this.prisma.responseOnQuestion.create({
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

  async getResponseByUserResponseId(userResponseId, questionId: number) {
    return await this.prisma.responseOnQuestion.findFirst({
      where: {
        useronResponseId: userResponseId,
        questionId: questionId,
      },
    });
  }

  async getAllResponseByUserResponseId(useronResponseId: number) {
    return await this.prisma.responseOnQuestion.findMany({
      where: {
        useronResponseId: useronResponseId,
      },
    });
  }
  async getResponseByUserResponseIdAndQuestionId(
    userResponseId: number,
    questionId: number,
  ) {
    return await this.prisma.responseOnQuestion.findFirst({
      where: {
        useronResponseId: userResponseId,
        questionId: questionId,
      },
    });
  }
}
