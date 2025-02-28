import { Injectable } from '@nestjs/common';
import { QuestionCondition } from 'src/models/QuestionCondition';
import { CreateQuestionConditionDto } from 'src/question-condition/dtos/create-question-condition-dto';
import { UpdateQuestionConditionDto } from 'src/question-condition/dtos/update-question-condition-dto';
import { IQuestionConditionRepository } from './i-repositories/question-consition.repository';
import { PrismaService } from 'src/config/providers/prisma.service';

@Injectable()
export class PrismaQuestionConditionRepository
  implements IQuestionConditionRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    targetQuestionId: number,
    sourceQuestionId: number,
  ): Promise<QuestionCondition> {
    const condition = await this.prisma.questionCondition.findFirst({
      where: {
        targetQuestionId: targetQuestionId,
        sourceQuestionId: sourceQuestionId,
      },
      include: { targetQuestion: true, sourceQuestion: true },
    });

    return QuestionCondition.fromPrisma(condition);
  }

  async findByTargetQuestionId(
    targetQuestionId: number,
  ): Promise<QuestionCondition> {
    const condition = await this.prisma.questionCondition.findMany({
      where: { targetQuestionId },
      include: { sourceQuestion: true, targetQuestion: true },
      orderBy: { sourceQuestion: { index: 'asc' } },
    });
    return QuestionCondition.fromPrisma(condition);
  }

  async findBySourceQuestionId(
    sourceQuestionId: number,
  ): Promise<QuestionCondition> {
    const condition = await this.prisma.questionCondition.findFirst({
      where: { sourceQuestionId },
      include: { sourceQuestion: true, targetQuestion: true },
      orderBy: { targetQuestion: { index: 'asc' } },
    });
    return QuestionCondition.fromPrisma(condition);
  }

  async create(data: CreateQuestionConditionDto): Promise<QuestionCondition> {
    const condition = await this.prisma.questionCondition.create({
      data: {
        targetQuestionId: data.targetQuestionId,
        sourceQuestionId: data.sourceQuestionId,
        conditionType: data.conditionType,
        conditionValue: data.conditionValue,
        logicalOperator: data.logicalOperator,
      },
      include: { sourceQuestion: true, targetQuestion: true },
    });
    return QuestionCondition.fromPrisma(condition);
  }

  async update(
    id: number,
    data: UpdateQuestionConditionDto,
  ): Promise<QuestionCondition> {
    const condition = await this.prisma.questionCondition.update({
      where: { id },
      data,
      include: { sourceQuestion: true, targetQuestion: true },
    });
    return QuestionCondition.fromPrisma(condition);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.questionCondition.delete({ where: { id } });
  }
}
