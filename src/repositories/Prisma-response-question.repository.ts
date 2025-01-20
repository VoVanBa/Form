import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import { CreateResponseOnQuestionDto } from 'src/response-survey/dtos/create.response.on.question.dto';
import { ResponseDto } from 'src/response-survey/dtos/response.dto';

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
    return this.prisma.responseOnQuestion.create({
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

  async getAll(formId: number) {
    return await this.prisma.question.findMany({
      where: { formId: formId, isDeleted: false },
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
        responseOnQuestions: true,
        businessQuestionConfiguration: {
          select: {
            settings: true,
          },
        },
      },
    });
  }
}
