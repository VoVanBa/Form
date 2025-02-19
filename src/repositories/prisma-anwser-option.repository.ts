import { Injectable } from '@nestjs/common';
import { AnswerOptionRepository } from './i-repositories/anwser-option.repository';
import { AddAnswerOptionDto } from 'src/question/dtos/add.answer.option.dto';
import { PrismaService } from 'src/config/prisma.service';
import { AnswerOption } from 'src/models/AnswerOption';

@Injectable()
export class PrismaAnswerOptionRepository implements AnswerOptionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllAnserOptionbyQuestionId(
    questionId: number,
  ): Promise<AnswerOption[]> {
    const answerOptions = await this.prismaService.answerOption.findMany({
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
  ): Promise<AnswerOption> {
    const createdOption = await this.prismaService.answerOption.create({
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

  async getQuantityAnserOptionbyQuestionId(questionId: number) {
    return this.prismaService.answerOption.count({
      where: {
        questionId: questionId,
      },
    });
  }

  async deleteAnserOption(id: number, questionId: number) {
    return this.prismaService.answerOption.delete({
      where: {
        id: id,
        questionId: questionId,
      },
    });
  }
  async findanswerOptionsByQuestionId(questionId) {
    return this.prismaService.answerOption.findMany({
      where: {
        questionId: questionId,
      },
    });
  }
  async updateAnswerOptions(answerOptionId: number, data: AddAnswerOptionDto) {
    return this.prismaService.answerOption.update({
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
