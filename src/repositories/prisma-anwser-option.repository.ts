import { UpdateQuestionDto } from './../question/dtos/update.question.dto';
import { Question } from 'src/models/Question';
import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { AnswerOptionRepository } from './i-repositories/anwser-option.repository';
import { AddAnswerOptionDto } from 'src/question/dtos/add.answer.option.dto';
import { PrismaService } from 'src/config/prisma.service';
import { AnswerOption } from 'src/models/AnswerOption';

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
  ): Promise<Partial<AnswerOption>> {
    const createdOption = this.prismaService.answerOption.create({
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
        ...data,
      },
    });
  }
}
