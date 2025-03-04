import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CreateQuestionConditionDto } from './dtos/create-question-condition-dto';
import { UpdateQuestionConditionDto } from './dtos/update-question-condition-dto';
import { PrismaQuestionConditionRepository } from 'src/repositories/prisma-questioncondition-repository';
import { QuestionCondition } from 'src/models/QuestionCondition';
import { QuestionType } from 'src/models/enums/QuestionType';
import { ConditionType } from 'src/models/enums/ConditionType';
import { LogicalOperator } from 'src/models/enums/LogicalOperator';
import { PrismaQuestionRepository } from 'src/repositories/prisma-question.repository';

@Injectable()
export class QuestionConditionService {
  private readonly logger = new Logger(QuestionConditionService.name);

  constructor(
    private questionConditionRepository: PrismaQuestionConditionRepository,
    private prismaQuestionRepository: PrismaQuestionRepository,
  ) {}

  async findById(id: number, tx?: any): Promise<QuestionCondition> {
    const condition = await this.questionConditionRepository.findById(id);
    if (!condition) {
      throw new NotFoundException(`Question condition with ID ${id} not found`);
    }
    return condition;
  }

  async create(
    data: CreateQuestionConditionDto,
    tx?: any,
  ): Promise<QuestionCondition> {
    // await this.validateQuestionOrder(data.questionId, data.role, tx);
    await this.validateConditionData(data, tx);

    return await this.questionConditionRepository.create(data, tx);
  }

  async update(
    id: number,
    data: UpdateQuestionConditionDto,
    tx?: any,
  ): Promise<QuestionCondition> {
    const existingCondition = await this.findById(id, tx);

    if (this.shouldValidateQuestionOrder(data, existingCondition)) {
      const questionId = data.questionId || existingCondition.questionId;
      const role = data.role || existingCondition.role;
      // await this.validateQuestionOrder(questionId, role, tx);
    }

    if (data.conditionValue || data.conditionType || data.logicalOperator) {
      await this.validateConditionData(
        {
          questionId: existingCondition.questionId,
          role: existingCondition.role,
          conditionType:
            data.conditionType || existingCondition.questionLogic.conditionType,
          conditionValue:
            data.conditionValue ||
            existingCondition.questionLogic.conditionValue,
          logicalOperator:
            data.logicalOperator ||
            existingCondition.questionLogic.logicalOperator,
        },
        tx,
      );
    }

    return await this.questionConditionRepository.update(id, data);
  }

  async updateQuestionConditions(
    questionId: number,
    conditions: CreateQuestionConditionDto[],
    tx?: any,
  ): Promise<void> {
    for (const condition of conditions) {
      if (condition.role === 'SOURCE') {
        await this.handleSourceCondition(questionId, condition, tx);
      } else if (condition.role === 'TARGET') {
        await this.handleTargetCondition(questionId, condition, tx);
      }
    }
  }

  async handleSourceCondition(
    questionId: number,
    condition: CreateQuestionConditionDto,
    tx?: any,
  ): Promise<number> {
    // await this.validateQuestionOrder(questionId, 'SOURCE', tx);
    await this.validateConditionData(condition, tx);
    const conditionLogic =
      await this.questionConditionRepository.createQuestionLogic(condition, tx);
    const questionSource = await this.questionConditionRepository.create(
      condition,
      conditionLogic.id,
      tx,
    );
    return questionSource.questionLogicId;
  }

  async getQuestionSourceById(questionId: number): Promise<any> {
    const data =
      await this.questionConditionRepository.getQuestionSourceById(questionId);

    return data;
  }

  async handleTargetCondition(
    questionId: number,
    condition: CreateQuestionConditionDto,
    questionLogicId: number,
    tx?: any,
  ): Promise<any> {
    // await this.validateQuestionOrder(questionId, 'TARGET', tx);
    await this.validateConditionData(condition, tx);

    const data = await this.questionConditionRepository.create(
      condition,
      questionLogicId,
      tx,
    );

    return data;
  }

  async updateConditionLogicId(
    conditionId: number,
    questionLogicId: number,

    tx?: any,
  ): Promise<void> {
    await this.questionConditionRepository.updateConditionLogicId(
      conditionId,
      questionLogicId,
      tx,
    );
  }

  // private async validateQuestionOrder(
  //   questionId: number,
  //   role: string,
  //   tx?: any,
  // ): Promise<void> {
  //   const currentQuestion = await this.prismaQuestionRepository.getQuessionById(
  //     questionId,
  //     tx,
  //   );
  //   if (!currentQuestion) {
  //     throw new BadRequestException(`Question with ID ${questionId} not found`);
  //   }

  //   if (role === 'SOURCE') {
  //     const targetConditions =
  //       await this.questionConditionRepository.findBySourceQuestionId(
  //         questionId,
  //       );
  //     console.log('targetConditions', questionId);
  //     for (const target of targetConditions) {
  //       const targetQuestion = target.question;
  //       if (currentQuestion.index >= targetQuestion.index) {
  //         throw new BadRequestException(
  //           'Source question must come before target question',
  //         );
  //       }
  //     }
  //   }

  //   if (role === 'TARGET') {
  //     const sourceConditions =
  //       await this.questionConditionRepository.findByTargetQuestionId(
  //         questionId,
  //       );
  //     for (const source of sourceConditions) {
  //       const sourceQuestion = source.question;
  //       if (sourceQuestion.index >= currentQuestion.index) {
  //         throw new BadRequestException(
  //           'Source question must come before target question',
  //         );
  //       }
  //     }
  //   }
  // }

  private async validateConditionData(
    data: CreateQuestionConditionDto,
    tx?: any,
  ): Promise<void> {
    if (data.role === 'TARGET') {
      // Kiểm tra xem sourceQuestionId có tồn tại không
      if (!data.questionId) {
        throw new BadRequestException(
          'sourceQuestionId is required for TARGET conditions.',
        );
      }

      // Kiểm tra xem câu hỏi SOURCE có tồn tại không
      const sourceQuestion =
        await this.prismaQuestionRepository.getQuessionById(data.questionId);
      if (!sourceQuestion) {
        throw new BadRequestException(
          `Source question with ID ${data.sourceQuestionId} not found.`,
        );
      }

      // Kiểm tra tính hợp lệ của conditionValue
      // if (
      //   !this.isValidConditionValue(
      //     sourceQuestion.questionType,
      //     data.conditionType,
      //     data.conditionValue,
      //   )
      // ) {
      //   throw new BadRequestException(
      //     'Invalid condition value for the question type.',
      //   );
      // }
    }

    if (data.role === 'SOURCE') {
      // Kiểm tra xem targetQuestionId có tồn tại không
      if (!data.questionId) {
        throw new BadRequestException(
          'targetQuestionId is required for SOURCE conditions.',
        );
      }

      // Kiểm tra xem câu hỏi TARGET có tồn tại không
      const targetQuestion =
        await this.prismaQuestionRepository.getQuessionById(data.questionId);
      if (!targetQuestion) {
        throw new BadRequestException(
          `Target question with ID ${data.targetQuestionId} not found.`,
        );
      }
    }
  }
  private isValidConditionValue(
    questionType: QuestionType,
    conditionType: ConditionType,
    value: any,
  ): boolean {
    const validators: Record<QuestionType, (value: any) => boolean> = {
      [QuestionType.SINGLE_CHOICE]: (v) =>
        typeof v?.answerOptionId === 'number',
      [QuestionType.MULTI_CHOICE]: (v) =>
        Array.isArray(v?.answerOptionIds) &&
        v.answerOptionIds.every((id) => typeof id === 'number'),
      [QuestionType.INPUT_TEXT]: (v) =>
        typeof v?.text === 'string' &&
        ['equals', 'contains', 'startsWith', 'endsWith'].includes(v?.matchType),
      [QuestionType.RATING_SCALE]: (v) =>
        typeof v?.value === 'number' &&
        ['equals', 'greaterThan', 'lessThan'].includes(v?.operator),
      [QuestionType.PICTURE_SELECTION]: (v) =>
        typeof v?.answerOptionId === 'number',
    };

    return validators[questionType]?.(value) ?? false;
  }

  private shouldValidateQuestionOrder(
    data: UpdateQuestionConditionDto,
    existingCondition: QuestionCondition,
  ): boolean {
    return Boolean(data.questionId || data.role);
  }

  async findByTargetQuestionId(
    questionId: number,
  ): Promise<QuestionCondition[]> {
    return await this.questionConditionRepository.findByTargetQuestionId(
      questionId,
    );
  }

  async delete(conditionId: number, tx?: any): Promise<void> {
    await this.questionConditionRepository.delete(conditionId);
  }

  async findAllByQuestionId(
    questionId: number,
    tx?: any,
  ): Promise<QuestionCondition[]> {
    return await this.questionConditionRepository.findAllByQuestionId(
      questionId,
      tx,
    );
  }

  async getTargeByLogiId(logicId: number) {
    return await this.questionConditionRepository.getTargetByLogicId(logicId);
  }


}
