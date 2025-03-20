import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';

import { PrismaQuestionConditionRepository } from 'src/question/repositories/prisma-questioncondition-repository';
import { QuestionType } from 'src/question/entities/enums/QuestionType';
import { ConditionType } from 'src/question/entities/enums/ConditionType';
import { QuestionRole } from 'src/question/entities/enums/QuestionRole';
import { QuestionService } from './question.service';
import { QuestionCondition } from '../entities/QuestionCondition';
import { CreateQuestionConditionDto } from '../dtos/create-question-condition-dto';
import { UpdateQuestionConditionDto } from '../dtos/update-question-condition-dto';

@Injectable()
export class QuestionConditionService {
  private readonly logger = new Logger(QuestionConditionService.name);

  constructor(
    private questionConditionRepository: PrismaQuestionConditionRepository,
    @Inject(forwardRef(() => QuestionService))
    private questionService: QuestionService,
  ) {}

  async findById(id: number): Promise<QuestionCondition> {
    const condition = await this.questionConditionRepository.findById(id);
    if (!condition) {
      throw new NotFoundException(`Question condition with ID ${id} not found`);
    }
    return condition;
  }

  async create(data: CreateQuestionConditionDto): Promise<QuestionCondition> {
    // await this.validateQuestionOrder(data.questionId, data.role);
    await this.validateConditionData(data);
    const logic =
      await this.questionConditionRepository.createQuestionLogic(data);
    return await this.questionConditionRepository.create(data, logic.id);
  }

  async update(
    id: number,
    data: UpdateQuestionConditionDto,
  ): Promise<QuestionCondition> {
    const existingCondition = await this.findById(id);

    if (this.shouldValidateQuestionOrder(data, existingCondition)) {
      const questionId = data.questionId || existingCondition.questionId;
      const role = data.role || existingCondition.role;
      // await this.validateQuestionOrder(questionId, role);
    }

    if (data.conditionValue || data.conditionType || data.logicalOperator) {
      await this.validateConditionData({
        questionId: existingCondition.questionId,
        role: existingCondition.role,
        conditionType:
          data.conditionType || existingCondition.questionLogic.conditionType,
        conditionValue:
          data.conditionValue || existingCondition.questionLogic.conditionValue,
        logicalOperator:
          data.logicalOperator ||
          existingCondition.questionLogic.logicalOperator,
      });
    }

    return await this.questionConditionRepository.update(id, data);
  }

  async updateQuestionConditions(
    questionId: number,
    conditions: CreateQuestionConditionDto[],
  ): Promise<void> {
    for (const condition of conditions) {
      if (condition.role === 'SOURCE') {
        await this.handleSourceCondition(questionId, condition);
      } else if (condition.role === 'TARGET') {
        await this.handleTargetCondition(
          questionId,
          condition.questionId,
          condition,
        );
      }
    }
  }

  async handleSourceCondition(
    questionId: number,
    condition: CreateQuestionConditionDto,
  ): Promise<number> {
    await this.validateQuestionOrder(questionId, 'SOURCE');
    await this.validateConditionData(condition);
    const conditionLogic =
      await this.questionConditionRepository.createQuestionLogic(condition);
    const questionSource = await this.questionConditionRepository.create(
      condition,
      conditionLogic.id,
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
    questionLogicId: number,
    condition: CreateQuestionConditionDto,
  ): Promise<any> {
    await this.validateQuestionOrder(questionId, 'TARGET');
    await this.validateConditionData(condition);

    const data = await this.questionConditionRepository.create(
      condition,
      questionLogicId,
    );

    return data;
  }

  async updateConditionLogicId(
    conditionId: number,
    questionLogicId: number,
  ): Promise<void> {
    await this.questionConditionRepository.updateConditionLogicId(
      conditionId,
      questionLogicId,
    );
  }

  private async validateQuestionOrder(
    questionId: number,
    role: string,
  ): Promise<void> {
    const currentQuestion =
      await this.questionService.getQuestionById(questionId);
    if (!currentQuestion) {
      throw new BadRequestException(`Question with ID ${questionId} not found`);
    }

    if (role === 'SOURCE') {
      const targetConditions =
        await this.questionConditionRepository.findBySourceQuestionId(
          questionId,
        );
      console.log('targetConditions', questionId);
      for (const target of targetConditions) {
        const targetQuestion = target.question;
        if (currentQuestion.index >= targetQuestion.index) {
          throw new BadRequestException(
            'Source question must come before target question',
          );
        }
      }
    }

    if (role === 'TARGET') {
      const sourceConditions =
        await this.questionConditionRepository.findByTargetQuestionId(
          questionId,
        );
      for (const source of sourceConditions) {
        const sourceQuestion = source.question;
        if (sourceQuestion.index >= currentQuestion.index) {
          throw new BadRequestException(
            'Source question must come before target question',
          );
        }
      }
    }
  }

  private async validateConditionData(
    data: CreateQuestionConditionDto,
  ): Promise<void> {
    if (data.role === 'TARGET') {
      // Kiểm tra xem sourceQuestionId có tồn tại không
      if (!data.questionId) {
        throw new BadRequestException(
          'sourceQuestionId is required for TARGET conditions.',
        );
      }

      // Kiểm tra xem câu hỏi SOURCE có tồn tại không
      const sourceQuestion = await this.questionService.getQuestionById(
        data.questionId,
      );
      if (!sourceQuestion) {
        throw new BadRequestException(`Source question not found.`);
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
      const targetQuestion = await this.questionService.getQuestionById(
        data.questionId,
      );
      if (!targetQuestion) {
        throw new BadRequestException(`Target question with  not found.`);
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

  async delete(conditionId: number): Promise<void> {
    await this.questionConditionRepository.delete(conditionId);
  }

  async findAllByQuestionId(questionId: number): Promise<QuestionCondition[]> {
    return await this.questionConditionRepository.findAllByQuestionId(
      questionId,
    );
  }

  async getTargeByLogiId(logicId: number, role: QuestionRole) {
    return await this.questionConditionRepository.getTargetByLogicId(
      logicId,
      role,
    );
  }
  async findConditionalQuestionsFromResponse(
    surveyId: number,
    sourceQuestionId: number,
    previousResponse: any,
  ): Promise<number[]> {
    // Tìm các điều kiện của câu hỏi nguồn
    const sourceConditions =
      await this.questionConditionRepository.findBySourceQuestionId(
        sourceQuestionId,
      );

    const conditionalQuestionIds: number[] = [];

    // Duyệt qua từng điều kiện
    for (const condition of sourceConditions) {
      const conditionLogic = condition.questionLogic;

      if (!conditionLogic) continue;

      // Kiểm tra điều kiện dựa trên loại câu hỏi và câu trả lời
      const isConditionMet = this.checkCondition(
        condition.question.questionType,
        previousResponse,
        conditionLogic.conditionValue,
        conditionLogic.conditionType,
      );

      // Nếu điều kiện thỏa mãn, tìm câu hỏi đích
      if (isConditionMet) {
        const targetCondition =
          await this.questionConditionRepository.getTargetByLogicId(
            conditionLogic.id,
            QuestionRole.TARGET,
          );

        if (targetCondition) {
          conditionalQuestionIds.push(targetCondition.questionId);
        }
      }
    }

    return conditionalQuestionIds;
  }

  private checkCondition(
    questionType: QuestionType,
    previousResponse: any,
    conditionValue: any,
    conditionType: string,
  ): boolean {
    switch (questionType) {
      case QuestionType.SINGLE_CHOICE:
        return (
          conditionValue.answerOptionId === previousResponse.answerOptionId
        );

      case QuestionType.MULTI_CHOICE:
        const responseOptions = previousResponse.answerOptionId || [];
        if (conditionType === 'CONTAINS') {
          return responseOptions.includes(conditionValue.answerOptionId);
        } else if (conditionType === 'NOT_CONTAINS') {
          return !responseOptions.includes(conditionValue.answerOptionId);
        }
        return false;

      case QuestionType.RATING_SCALE:
        const rating = previousResponse.ratingValue;
        switch (conditionType) {
          case 'EQUALS':
            return rating === conditionValue.value;
          case 'GREATER_THAN':
            return rating > conditionValue.value;
          case 'LESS_THAN':
            return rating < conditionValue.value;
          case 'BETWEEN':
            return rating >= conditionValue.min && rating <= conditionValue.max;
        }
        return false;

      case QuestionType.INPUT_TEXT:
        const text = previousResponse.answer;
        switch (conditionType) {
          case 'EQUALS':
            return text === conditionValue.value;
          case 'CONTAINS':
            return text.includes(conditionValue.value);
        }
        return false;

      default:
        return false;
    }
  }
}
