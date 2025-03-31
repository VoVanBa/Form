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

  async deleteAnwserOption(id: number, questionId: number) {
    return await this.prismaAnswerOptionRepository.deleteAnwserOption(
      id,
      questionId,
    );
  }
  async deleteManyAnserOption(ids: number[]) {
    return await this.prismaAnswerOptionRepository.deleteManyAnwserOption(ids);
  }

  async updateAnswerOptions(answerOptionId: number, data: AddAnswerOptionDto) {
    return await this.prismaAnswerOptionRepository.updateAnswerOptions(
      answerOptionId,
      data,
    );
  }

  async updateManyAnswerOptions(data: AddAnswerOptionDto[]) {
    return await this.prismaAnswerOptionRepository.updateManyAnswerOptions(
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

  async createManyAnswerOption(
    questionId: number,
    answerOptions: AddAnswerOptionDto[],
    index: number,
  ) {
    return await this.prismaAnswerOptionRepository.createManyAnswerOptions(
      questionId,
      answerOptions,
      index,
    );
  }
}
