import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { AnswerOptionRepository } from './i-repositories/anwser-option.repository';
import { AddAnswerOptionDto } from 'src/question/dtos/add.answer.option.dto';
import { PrismaService } from 'src/config/prisma.service';

@Injectable()
export class PrismaAnswerOptionRepository implements AnswerOptionRepository {
  constructor(private readonly prismaService: PrismaService) {}
  getAllAnserOptionbyQuestionId(questionId: number) {
    throw new Error('Method not implemented.');
  }

  async createAnswerOptions(
    questionId: number,
    answerOptions: AddAnswerOptionDto,
    index: number,
  ) {
    const createdOption = await this.prismaService.answerOption.create({
      data: {
        questionId,
        label: answerOptions.label,
        isActive: answerOptions.isActive,
        index: index,
        description: answerOptions.description,
      },
    });
    return createdOption;
  }

  async getQuantityAnserOptionbyQuestionId(questionId: number) {
    return await this.prismaService.answerOption.count({
      where: {
        questionId: questionId,
      },
    });
  }

  async deleteAnserOption(ids: number) {
    return await this.prismaService.answerOption.delete({
      where: {
        id: ids,
      },
    });
  }
  async findanswerOptionsByQuestionId(questionId) {
    return await this.prismaService.answerOption.findMany({
      where: {
        questionId: questionId,
      },
    });
  }
}
