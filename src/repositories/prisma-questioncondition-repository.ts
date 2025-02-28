// import { Injectable } from '@nestjs/common';
// import { QuestionCondition } from 'src/models/QuestionCondition';
// import { CreateQuestionConditionDto } from 'src/question-condition/dtos/create-question-condition-dto';
// import { UpdateQuestionConditionDto } from 'src/question-condition/dtos/update-question-condition-dto';
// import { PrismaService } from 'src/config/providers/prisma.service';
// import { IQuestionConditionRepository } from './i-repositories/question-consition.repository';

// @Injectable()
// export class PrismaQuestionConditionRepository
//   implements IQuestionConditionRepository
// {
//   // constructor(private readonly prisma: PrismaService) {}

//   // // Tìm theo ID của QuestionCondition
//   // async findById(id: number): Promise<QuestionCondition> {
//   //   const condition = await this.prisma.questionCondition.findUnique({
//   //     where: { id },
//   //     include: { question: true, questionLogic: true },
//   //   });
//   //   return QuestionCondition.fromPrisma(condition);
//   // }

//   // // Tìm tất cả điều kiện mà một câu hỏi là TARGET
//   // async findByTargetQuestionId(
//   //   targetQuestionId: number,
//   // ): Promise<QuestionCondition[]> {
//   //   const conditions = await this.prisma.questionCondition.findMany({
//   //     where: {
//   //       questionId: targetQuestionId,
//   //       role: 'TARGET',
//   //     },
//   //     include: {
//   //       question: true,
//   //       questionLogic: { include: { conditions: true } },
//   //     },
//   //     orderBy: { questionLogicId: 'asc' }, // Sắp xếp theo logic nếu cần
//   //   });
//   //   return conditions.map((condition) =>
//   //     QuestionCondition.fromPrisma(condition),
//   //   );
//   // }

//   // // Tìm tất cả điều kiện mà một câu hỏi là SOURCE
//   // async findBySourceQuestionId(
//   //   sourceQuestionId: number,
//   // ): Promise<QuestionCondition[]> {
//   //   const conditions = await this.prisma.questionCondition.findMany({
//   //     where: {
//   //       questionId: sourceQuestionId,
//   //       role: 'SOURCE',
//   //     },
//   //     include: {
//   //       question: true,
//   //       questionLogic: { include: { conditions: true } },
//   //     },
//   //     orderBy: { questionLogicId: 'asc' },
//   //   });
//   //   return conditions.map((condition) =>
//   //     QuestionCondition.fromPrisma(condition),
//   //   );
//   // }

//   // // Tạo mới QuestionCondition
//   // async create(data: CreateQuestionConditionDto): Promise<QuestionCondition> {
//   //   const condition = await this.prisma.questionCondition.create({
//   //     data: {
//   //       questionId: data.questionId,
//   //       questionLogic: {
//   //         create: {
//   //           conditionType: data.conditionType,
//   //           conditionValue: data.conditionValue,
//   //           logicalOperator: data.logicalOperator,
//   //         },
//   //       },
//   //       role: data.role,
//   //     },
//   //     include: { question: true, questionLogic: true },
//   //   });
//   //   return QuestionCondition.fromPrisma(condition);
//   // }

//   // // Cập nhật QuestionCondition
//   // async update(
//   //   id: number,
//   //   data: UpdateQuestionConditionDto,
//   // ): Promise<QuestionCondition> {
//   //   const condition = await this.prisma.questionCondition.update({
//   //     where: { id },
//   //     data: {
//   //       questionId: data.questionId,
//   //       questionLogic: {
//   //         update: {
//   //           conditionType: data.conditionType,
//   //           conditionValue: data.conditionValue,
//   //           logicalOperator: data.logicalOperator,
//   //         },
//   //       },
//   //       role: data.role,
//   //     },
//   //     include: { question: true, questionLogic: true },
//   //   });
//   //   return QuestionCondition.fromPrisma(condition);
//   // }

//   // // Xóa QuestionCondition
//   // async delete(id: number): Promise<void> {
//   //   await this.prisma.questionCondition.delete({ where: { id } });
//   // }
// }
