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

  async findByQuestionId(questionId: number): Promise<QuestionLogic[]> {
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

  async deleteByQuestionId(questionId: number): Promise<{ count: number }> {
    return this.questionLogicRepository.deleteQuestionLogicsByQuestionId(
      questionId,
    );
  }

  async updateQuestionLogics(
    questionId: number,
    conditions: UpdateQuestionLogicDto[],
  ): Promise<void> {
    // First, get existing logic rules
    const existingLogics = await this.findByQuestionId(questionId);

    // Delete all existing logic rules for this question
    await this.deleteByQuestionId(questionId);

    // Create new logic rules
    if (conditions && conditions.length > 0) {
      await this.createMany(conditions);
    }
  }
}
