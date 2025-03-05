import { LogicalOperator } from 'src/models/enums/LogicalOperator';
import { Injectable } from '@nestjs/common';
import { QuestionCondition } from 'src/models/QuestionCondition';
import { CreateQuestionConditionDto } from 'src/question-condition/dtos/create-question-condition-dto';
import { UpdateQuestionConditionDto } from 'src/question-condition/dtos/update-question-condition-dto';
import { PrismaService } from 'src/config/providers/prisma.service';
import { IQuestionConditionRepository } from './i-repositories/question-consition.repository';
import { QuestionLogic } from 'src/models/QuestionLogic';
import { QuestionRole } from 'src/models/enums/QuestionRole';

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
    return QuestionCondition.fromPrisma(condition);
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
    return conditions.map((condition) =>
      QuestionCondition.fromPrisma(condition),
    );
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
    return conditions.map((condition) =>
      QuestionCondition.fromPrisma(condition),
    );
  }

  async create(
    data: CreateQuestionConditionDto,
    questionLogicId?: number,
    tx?: any,
  ): Promise<QuestionCondition> {
    const prismaClient = tx || this.prisma;

    const condition = await prismaClient.questionCondition.create({
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

    return QuestionCondition.fromPrisma(condition);
  }

  async createQuestionLogic(
    data: CreateQuestionConditionDto,
    tx?: any,
  ): Promise<QuestionLogic> {
    const prismaClient = tx || this.prisma;

    const condition = await prismaClient.questionLogic.create({
      data: {
        conditionType: data.conditionType,
        conditionValue: data.conditionValue,
        logicalOperator: data.logicalOperator,
      },
    });
    console.log('Prisma created condition:', condition);
    return QuestionLogic.fromPrisma(condition);
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
    return QuestionCondition.fromPrisma(condition);
  }

  // Xóa QuestionCondition
  async delete(id: number): Promise<void> {
    await this.prisma.questionCondition.delete({ where: { id } });
  }

  async findAllByQuestionId(
    questionId: number,
    tx?: any,
  ): Promise<QuestionCondition[]> {
    const prismaClient = tx || this.prisma; // Dùng tx nếu có, không thì dùng client chính
    const conditions = await prismaClient.questionCondition.findMany({
      where: { questionId },
      include: {
        question: true,
        questionLogic: true,
      },
    });
    return conditions.map(QuestionCondition.fromPrisma);
  }

  async getQuestionSourceById(questionId: number): Promise<QuestionLogic> {
    const data = await this.prisma.questionCondition.findFirst({
      where: { questionId: questionId },
    });
    return QuestionLogic.fromPrisma(data);
  }

  async updateConditionLogicId(
    id: number,
    questionLogicId: number,
    tx?: any,
  ): Promise<void> {
    const prismaClient = tx || this.prisma;
    await prismaClient.questionCondition.update({
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
    return QuestionCondition.fromPrisma(data);
  }
}
