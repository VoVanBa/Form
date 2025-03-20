import { Injectable } from '@nestjs/common';
import { PrismaAnswerOptionRepository } from 'src/answer-option/repositories/prisma-anwser-option.repository';
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
  ) {
    return await this.prismaAnswerOptionRepository.createAnswerOptions(
      questionId,
      answerOptions,
      index,
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

  async deleteAnserOption(id: number, questionId: number) {
    return await this.prismaAnswerOptionRepository.deleteAnserOption(
      id,
      questionId,
    );
  }

  async updateAnswerOptions(answerOptionId: number, data: AddAnswerOptionDto) {
    return await this.prismaAnswerOptionRepository.updateAnswerOptions(
      answerOptionId,
      data,
    );
  }
  async findanswerOptionsByQuestionId(questionId: number) {
    return await this.prismaAnswerOptionRepository.getAllAnserOptionbyQuestionId(
      questionId,
    );
  }
  async getAllAnserOptionbyQuestionId(questionId: number) {
    const answerOptions =
      await this.prismaAnswerOptionRepository.getAllAnserOptionbyQuestionId(
        questionId,
      );
    return answerOptions;
  }

  async bulkUpdateAnswerOptions(
    updates: { id: number; data: AddAnswerOptionDto }[],
  ) {
    return await this.prismaAnswerOptionRepository.bulkUpdateAnswerOptions(
      updates,
    );
  }

  async bulkDeleteAnswerOptions(ids: number[]) {
    await this.prismaAnswerOptionRepository.bulkDeleteAnswerOptions(ids);
  }

  async bulkCreateAnswerOptions(
    questionId: number,
    answerOptions: AddAnswerOptionDto[],
  ) {
    return await this.prismaAnswerOptionRepository.bulkCreateAnswerOptions(
      questionId,
      answerOptions,
    );
  }
}
