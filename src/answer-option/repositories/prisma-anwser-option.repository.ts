import { Injectable } from '@nestjs/common';
import { AddAnswerOptionDto } from 'src/answer-option/dtos/add.answer.option.dto';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { AnswerOptionOnMedia } from 'src/media/entities/AnswerOptionOnMedia';
import { AnswerOptionRepository } from './interface/anwser-option.repository';
import { AnswerOption } from '../entities/AnswerOption';

@Injectable()
export class PrismaAnswerOptionRepository implements AnswerOptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async bulkUpdateAnswerOptions(
    updates: { id: number; data: AddAnswerOptionDto }[],
  ): Promise<AnswerOption[]> {
    const updatePromises = updates.map(({ id, data }) =>
      this.prisma.answerOption.update({
        where: { id },
        data: {
          label: data.label,
          isActive: data.isActive,
          description: data.description,
        },
      }),
    );

    const updatedOptions = await Promise.all(updatePromises);
    return updatedOptions.map((option) => new AnswerOption(option));
  }

  async bulkDeleteAnswerOptions(ids: number[]): Promise<void> {
    await this.prisma.answerOption.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async getAllAnserOptionbyQuestionId(
    questionId: number,
  ): Promise<AnswerOption[]> {
    const answerOptions = await this.prisma.answerOption.findMany({
      where: {
        questionId: questionId,
      },
      include: {
        answerOptionOnMedia: true, // Dữ liệu Prisma trả về
      },
    });

    return answerOptions.map(
      (option) =>
        new AnswerOption({
          ...option,
          answerOptionOnMedia: option.answerOptionOnMedia
            ? new AnswerOptionOnMedia(option.answerOptionOnMedia)
            : undefined,
        }),
    );
  }

  async createAnswerOptions(
    questionId: number,
    answerOptions: AddAnswerOptionDto,
    index: number,
  ): Promise<AnswerOption> {
    const createdOption = await this.prisma.answerOption.create({
      data: {
        question: {
          connect: {
            id: questionId,
          },
        },
        label: answerOptions.label,
        isActive: answerOptions.isActive,
        index: index,
        description: answerOptions.description,
        answerOptionOnMedia: answerOptions.imageIds
          ? {
              create: {
                mediaId: answerOptions.imageIds,
              },
            }
          : undefined,
      },
    });

    return new AnswerOption(createdOption);
  }

  async getQuantityAnserOptionbyQuestionId(questionId: number) {
    return this.prisma.answerOption.count({
      where: {
        questionId: questionId,
      },
    });
  }

  async deleteAnserOption(id: number, questionId: number) {
    return this.prisma.answerOption.delete({
      where: {
        id: id,
        questionId: questionId,
      },
    });
  }

  async findanswerOptionsByQuestionId(questionId: number) {
    return this.prisma.answerOption.findMany({
      where: {
        questionId: questionId,
      },
    });
  }

  async updateAnswerOptions(
    answerOptionId: number,
    data: AddAnswerOptionDto,
  ): Promise<AnswerOption> {
    const response = await this.prisma.answerOption.update({
      where: {
        id: answerOptionId,
      },
      data: {
        label: data.label,
        isActive: data.isActive,
        description: data.description,
      },
    });
    return new AnswerOption(response);
  }
  async bulkCreateAnswerOptions(
    questionId: number,
    answerOptions: AddAnswerOptionDto[],
  ): Promise<AnswerOption[]> {
    await this.prisma.answerOption.createMany({
      data: answerOptions.map((option, index) => ({
        questionId,
        label: option.label,
        isActive: option.isActive,
        index,
        description: option.description,
      })),
      skipDuplicates: true, // Tránh lỗi nếu có dữ liệu trùng lặp
    });

    const createdOptions = await this.prisma.answerOption.findMany({
      where: {
        questionId,
      },
    });

    return createdOptions.map((option) => new AnswerOption(option));
  }
}
