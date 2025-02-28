import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateQuestionConditionDto } from './dtos/create-question-condition-dto';
import { UpdateQuestionConditionDto } from './dtos/update-question-condition-dto';
// import { PrismaQuestionConditionRepository } from 'src/repositories/prisma-questioncondition-repository';
import { QuestionCondition } from 'src/models/QuestionCondition';
import { QuestionType } from 'src/models/enums/QuestionType';
import { ConditionType } from 'src/models/enums/ConditionType';
import { LogicalOperator } from 'src/models/enums/LogicalOperator';
@Injectable()
export class QuestionConditionService {
  // constructor() {
  // private readonly questionConditionRepository: PrismaQuestionConditionRepository}

  // async findById(
  //   targetQuestionId: number,
  //   sourceQuestionId: number,
  // ): Promise<QuestionCondition> {
  //   const condition = await this.questionConditionRepository.findById(
  //     targetQuestionId,
  //     sourceQuestionId,
  //   );
  //   if (!condition) {
  //     throw new NotFoundException(`Question condition with ID not found`);
  //   }
  //   return condition;
  // }

  // async create(data: CreateQuestionConditionDto): Promise<QuestionCondition> {
  //   await this.validateQuestionOrder(
  //     data.sourceQuestionId,
  //     data.targetQuestionId,
  //   );
  //   await this.validateConditionData(data);

  //   return await this.questionConditionRepository.create(data);
  // }

  // async update(data: UpdateQuestionConditionDto): Promise<QuestionCondition> {
  //   const existingCondition = await this.findById(
  //     data.targetQuestionId,
  //     data.sourceQuestionId,
  //   );

  //   if (this.shouldValidateQuestionOrder(data, existingCondition)) {
  //     await this.validateQuestionOrder(
  //       data.sourceQuestionId || existingCondition.sourceQuestionId,
  //       data.targetQuestionId || existingCondition.targetQuestionId,
  //     );
  //   }

  //   if (data.conditionValue) {
  //     await this.validateConditionData({
  //       ...existingCondition,
  //       ...data,
  //       logicalOperator: data.logicalOperator as LogicalOperator,
  //     });
  //   }

  //   return await this.questionConditionRepository.update(
  //     existingCondition.id,
  //     data,
  //   );
  // }

  // private async validateQuestionOrder(
  //   sourceQuestionId: number,
  //   targetQuestionId: number,
  // ): Promise<void> {
  //   const [sourceQuestion, targetQuestion] = await Promise.all([
  //     this.questionConditionRepository.findBySourceQuestionId(sourceQuestionId),
  //     this.questionConditionRepository.findByTargetQuestionId(targetQuestionId),
  //   ]);

  //   if (!sourceQuestion || !targetQuestion) {
  //     throw new BadRequestException(
  //       'Source question or target question not found',
  //     );
  //   }

  //   if (
  //     sourceQuestion.sourceQuestion.index >= targetQuestion.targetQuestion.index
  //   ) {
  //     throw new BadRequestException(
  //       'Source question must come before target question',
  //     );
  //   }
  // }

  // private async validateConditionData(
  //   data: CreateQuestionConditionDto | QuestionCondition,
  // ): Promise<void> {
  //   const sourceQuestion =
  //     await this.questionConditionRepository.findBySourceQuestionId(
  //       data.sourceQuestionId,
  //     );

  //   if (
  //     !this.isValidConditionValue(
  //       sourceQuestion.sourceQuestion.questionType,
  //       data.conditionType,
  //       data.conditionValue,
  //     )
  //   ) {
  //     throw new BadRequestException(
  //       'Invalid condition value for the question type',
  //     );
  //   }
  // }

  // private isValidConditionValue(
  //   questionType: QuestionType,
  //   conditionType: ConditionType,
  //   value: any,
  // ): boolean {
  //   const validators: Record<QuestionType, (value: any) => boolean> = {
  //     [QuestionType.SINGLE_CHOICE]: (v) =>
  //       typeof v?.answerOptionId === 'number',
  //     [QuestionType.MULTI_CHOICE]: (v) =>
  //       Array.isArray(v?.answerOptionIds) &&
  //       v.answerOptionIds.every((id) => typeof id === 'number'),
  //     [QuestionType.INPUT_TEXT]: (v) =>
  //       typeof v?.text === 'string' &&
  //       ['equals', 'contains', 'startsWith', 'endsWith'].includes(v?.matchType),
  //     [QuestionType.RATING_SCALE]: (v) =>
  //       typeof v?.value === 'number' &&
  //       ['equals', 'greaterThan', 'lessThan'].includes(v?.operator),
  //     [QuestionType.PICTURE_SELECTION]: (v) =>
  //       typeof v?.answerOptionId === 'number',
  //   };

  //   return validators[questionType]?.(value) ?? false;
  // }

  // private shouldValidateQuestionOrder(
  //   data: UpdateQuestionConditionDto,
  //   existingCondition: QuestionCondition,
  // ): boolean {
  //   return Boolean(data.sourceQuestionId || data.targetQuestionId);
  // }
}
