import { Injectable } from '@nestjs/common';
import { PrismaAnswerOptionRepository } from 'src/repositories/prisma-anwser-option.repository';
import { AddAnswerOptionDto } from './dtos/add.answer.option.dto';

@Injectable()
export class AnswerOptionService {
  constructor(
    private prismaAnswerOptionRepository: PrismaAnswerOptionRepository,
  ) {}
  async createAnswerOptions(
    questionId: number,
    answerOptions: AddAnswerOptionDto,
    index: number,
    tx?: any,
  ) {
    return await this.prismaAnswerOptionRepository.createAnswerOptions(
      questionId,
      answerOptions,
      index,
      tx,
    );
  }

  async getQuantityAnserOptionbyQuestionId(
    questionId: number,
  ): Promise<number> {
    const quantity =
      await this.prismaAnswerOptionRepository.getQuantityAnserOptionbyQuestionId(
        questionId,
      );
    return quantity;
  }

  async deleteAnserOption(id: number, questionId: number, tx?: any) {
    return await this.prismaAnswerOptionRepository.deleteAnserOption(
      id,
      questionId,
      tx,
    );
  }

  async updateAnswerOptions(
    answerOptionId: number,
    data: AddAnswerOptionDto,
    tx?: any,
  ) {
    return await this.prismaAnswerOptionRepository.updateAnswerOptions(
      answerOptionId,
      data,
      tx,
    );
  }
  async findanswerOptionsByQuestionId(questionId: number, tx?: any) {
    return await this.prismaAnswerOptionRepository.getAllAnserOptionbyQuestionId(
      questionId,
      tx,
    );
  }
  async getAllAnserOptionbyQuestionId(questionId: number) {
    return await this.prismaAnswerOptionRepository.getAllAnserOptionbyQuestionId(
      questionId,
    );
  }
}
