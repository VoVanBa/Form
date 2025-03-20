import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { IQuestionConditionRepository } from './interface/question-consition.repository';
import { QuestionRole } from 'src/question/entities/enums/QuestionRole';
import { QuestionCondition } from '../entities/QuestionCondition';
import { CreateQuestionConditionDto } from '../dtos/create-question-condition-dto';
import { QuestionLogic } from '../entities/QuestionLogic';
import { UpdateQuestionConditionDto } from '../dtos/update-question-condition-dto';

@Injectable()
export class PrismaQuestionConditionRepository
  implements IQuestionConditionRepository
{
  constructor(private readonly prisma: PrismaService) {}

  // Tìm theo ID của QuestionCondition
  async findById(id: number): Promise<QuestionCondition> {
    const condition = await this.prisma.questionCondition.findUnique({
      where: { id },
      include: { question: true, questionLogic: true },
    });
    return new QuestionCondition(condition);
  }

  // Tìm tất cả điều kiện mà một câu hỏi là TARGET
  async findByTargetQuestionId(
    targetQuestionId: number,
  ): Promise<QuestionCondition[]> {
    const conditions = await this.prisma.questionCondition.findMany({
      where: {
        questionId: targetQuestionId,
        role: 'TARGET',
      },
      include: {
        question: true,
        questionLogic: true,
      },
      orderBy: { questionLogicId: 'asc' }, // Sắp xếp theo logic nếu cần
    });
    return conditions.map((condition) => new QuestionCondition(condition));
  }

  // Tìm tất cả điều kiện mà một câu hỏi là SOURCE
  async findBySourceQuestionId(
    sourceQuestionId: number,
  ): Promise<QuestionCondition[]> {
    const conditions = await this.prisma.questionCondition.findMany({
      where: {
        questionId: sourceQuestionId,
        role: 'SOURCE',
      },
      include: {
        question: true,
        questionLogic: true,
      },
      orderBy: { questionLogicId: 'asc' },
    });
    return conditions.map((condition) => new QuestionCondition(condition));
  }

  async create(
    data: CreateQuestionConditionDto,
    questionLogicId: number,
  ): Promise<QuestionCondition> {
    const condition = await this.prisma.questionCondition.create({
      data: {
        questionId: data.questionId,
        role: data.role,
        questionLogicId: questionLogicId,
      },
      include: {
        question: true,
        questionLogic: true,
      },
    });

    return new QuestionCondition(condition);
  }

  async createQuestionLogic(
    data: CreateQuestionConditionDto,
  ): Promise<QuestionLogic> {
    const condition = await this.prisma.questionLogic.create({
      data: {
        conditionType: data.conditionType,
        conditionValue: data.conditionValue,
        logicalOperator: data.logicalOperator,
      },
    });
    console.log('Prisma created condition:', condition);
    return new QuestionLogic(condition);
  }

  async update(
    id: number,
    data: UpdateQuestionConditionDto,
  ): Promise<QuestionCondition> {
    const condition = await this.prisma.questionCondition.update({
      where: { id },
      data: {
        questionLogic: {
          update: {
            conditionType: data.conditionType,
            conditionValue: data.conditionValue,
            logicalOperator: data.logicalOperator,
          },
        },
        role: data.role,
      },
      include: { question: true, questionLogic: true },
    });
    return new QuestionCondition(condition);
  }

  // Xóa QuestionCondition
  async delete(id: number): Promise<void> {
    await this.prisma.questionCondition.delete({ where: { id } });
  }

  async findAllByQuestionId(questionId: number): Promise<QuestionCondition[]> {
    const conditions = await this.prisma.questionCondition.findMany({
      where: { questionId },
      include: {
        question: true,
        questionLogic: true,
      },
    });
    return conditions.map((data) => new QuestionCondition(data));
  }

  async getQuestionSourceById(questionId: number): Promise<QuestionLogic> {
    const data = await this.prisma.questionCondition.findFirst({
      where: { questionId: questionId },
    });
    return new QuestionLogic(data);
  }

  async updateConditionLogicId(
    id: number,
    questionLogicId: number,
  ): Promise<void> {
    await this.prisma.questionCondition.update({
      where: { id },
      data: { questionLogicId: questionLogicId },
    });
  }

  async getTargetByLogicId(
    logicId: number,
    role: QuestionRole,
  ): Promise<QuestionCondition> {
    const data = await this.prisma.questionCondition.findFirst({
      where: {
        questionLogicId: logicId,
        role: role,
      },
    });
    return new QuestionCondition(data);
  }
}
