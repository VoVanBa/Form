import { Injectable, NotFoundException } from '@nestjs/common';

import { QuestionLogic } from '../entities/QuestionLogic';
import { PrismaQuestionLogicRepository } from '../repositories/prisma-questioncondition-repository';
import { CreateQuestionLogicDto } from '../dtos/create-question-condition-dto';
import { UpdateQuestionLogicDto } from '../dtos/update-question-condition-dto';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class QuestionLogicService {
  constructor(
    private questionLogicRepository: PrismaQuestionLogicRepository,
    private i18n: I18nService,
  ) {}
  async create(createDto: CreateQuestionLogicDto): Promise<QuestionLogic> {
    const createQuestionLogicDto: CreateQuestionLogicDto = {
      questionId: createDto.questionId,
      conditionType: createDto.conditionType,
      conditionValue: createDto.conditionValue,
      logicalOperator: createDto.logicalOperator,
      jumpToQuestionId: createDto.jumpToQuestionId,
      actionType: createDto.actionType,
    };

    return this.questionLogicRepository.createQuestionLogic(
      createQuestionLogicDto,
    );
  }

  async createMany(
    conditions: CreateQuestionLogicDto[],
  ): Promise<{ count: number }> {
    return this.questionLogicRepository.createManyQuestionLogic(conditions);
  }

  async findById(id: number): Promise<QuestionLogic> {
    const questionLogic =
      await this.questionLogicRepository.getQuestionLogicById(id);
    if (!questionLogic) {
      throw new NotFoundException(
        this.i18n.translate('errors.QUESTIONLOGICNOTFOUND'),
      );
    }
    return questionLogic;
  }

  async findAllByQuestionId(questionId: number): Promise<QuestionLogic[]> {
    return this.questionLogicRepository.getQuestionLogicsByQuestionId(
      questionId,
    );
  }

  async update(id: number, updateDto: UpdateQuestionLogicDto) {
    await this.findById(id);

    return this.questionLogicRepository.updateQuestionLogic(id, updateDto);
  }

  async delete(id: number) {
    await this.findById(id);
    return this.questionLogicRepository.deleteQuestionLogic(id);
  }

  async deleteAllByQuestionId(questionId: number): Promise<{ count: number }> {
    return this.questionLogicRepository.deleteQuestionLogicsByQuestionId(
      questionId,
    );
  }

  async updateQuestionLogics(
    questionId: number,
    conditions: UpdateQuestionLogicDto[],
  ): Promise<void> {
    // Fetch existing conditions
    const existingConditions =
      await this.questionLogicRepository.getQuestionLogicsByQuestionId(
        questionId,
      );

    // Delete conditions that are no longer needed
    const existingConditionIds = existingConditions.map((cond) => cond.id);
    const newConditionIds = conditions.map((cond) => cond.id).filter(Boolean);
    const conditionIdsToDelete = existingConditionIds.filter(
      (id) => !newConditionIds.includes(id),
    );

    if (conditionIdsToDelete.length > 0) {
      await this.questionLogicRepository.deleteQuestionLogicsByIds(
        conditionIdsToDelete,
      );
    }

    // Update existing conditions and add new conditions
    await Promise.all(
      conditions.map(async (condition) => {
        if (condition.id) {
          // Update existing condition
          await this.questionLogicRepository.updateQuestionLogic(
            condition.id,
            condition,
          );
        } else {
          // Add new condition
          const createConditionDto: CreateQuestionLogicDto = {
            questionId,
            conditionType: condition.conditionType,
            conditionValue: condition.conditionValue,
            logicalOperator: condition.logicalOperator,
            actionType: condition.actionType,
            jumpToQuestionId: condition.jumpToQuestionId,
          };
          await this.questionLogicRepository.createQuestionLogic(
            createConditionDto,
          );
        }
      }),
    );
  }
}
