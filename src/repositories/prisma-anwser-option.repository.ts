import { Injectable } from '@nestjs/common';
import { AnswerOptionRepository } from './i-repositories/anwser-option.repository';
import { AddAnswerOptionDto } from 'src/answer-option/dtos/add.answer.option.dto';
import { PrismaService } from 'src/config/providers/prisma.service';
import { AnswerOption } from 'src/models/AnswerOption';

@Injectable()
export class PrismaAnswerOptionRepository implements AnswerOptionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllAnserOptionbyQuestionId(
    questionId: number,
    tx?: any,
  ): Promise<AnswerOption[]> {
    const prisma = tx || this.prismaService;
    const answerOptions = await prisma.answerOption.findMany({
      where: {
        questionId: questionId,
      },
      include: {
        answerOptionOnMedia: true,
      },
    });
    return answerOptions.map((data) => AnswerOption.fromPrisma(data));
  }

  async createAnswerOptions(
    questionId: number,
    answerOptions: AddAnswerOptionDto,
    index: number,
    tx?: any,
  ): Promise<AnswerOption> {
    const prisma = tx || this.prismaService;
    const createdOption = await prisma.answerOption.create({
      data: {
        questionId,
        label: answerOptions.label,
        isActive: answerOptions.isActive,
        index: index,
        description: answerOptions.description,
      },
    });
    const response = AnswerOption.fromPrisma(createdOption);
    return response;
  }

  async getQuantityAnserOptionbyQuestionId(questionId: number, tx?: any) {
    const prisma = tx || this.prismaService;
    return prisma.answerOption.count({
      where: {
        questionId: questionId,
      },
    });
  }

  async deleteAnserOption(id: number, questionId: number, tx?: any) {
    const prisma = tx || this.prismaService;
    return prisma.answerOption.delete({
      where: {
        id: id,
        questionId: questionId,
      },
    });
  }

  async findanswerOptionsByQuestionId(questionId: number, tx?: any) {
    const prisma = tx || this.prismaService;
    return prisma.answerOption.findMany({
      where: {
        questionId: questionId,
      },
    });
  }

  async updateAnswerOptions(
    answerOptionId: number,
    data: AddAnswerOptionDto,
    tx?: any,
  ) {
    const prisma = tx || this.prismaService;
    return prisma.answerOption.update({
      where: {
        id: answerOptionId,
      },
      data: {
        label: data.label,
        isActive: data.isActive,
        description: data.description,
      },
    });
  }
}
