import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { CreateQuestionLogicDto } from '../dtos/create-question-condition-dto';
import { ConditionType } from '../entities/enums/ConditionType';
import { QuestionLogic } from '../entities/QuestionLogic';

@Injectable()
export class PrismaQuestionLogicRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createQuestionLogic(
    createQuestionLogicDto: CreateQuestionLogicDto,
  ): Promise<QuestionLogic> {
    const {
      questionId,
      conditionType,
      conditionValue,
      logicalOperator,
      jumpToQuestionId,
    } = createQuestionLogicDto;

    const questionLogic = await this.prisma.questionLogic.create({
      data: {
        questionId,
        conditionType,
        conditionValue,
        logicalOperator: logicalOperator || 'AND',
        jumpToQuestionId,
      },
    });
    return new QuestionLogic(questionLogic);
  }

  async createManyQuestionLogic(
    createQuestionLogicDtos: CreateQuestionLogicDto[],
  ): Promise<{ count: number }> {
    return this.prisma.questionLogic.createMany({
      data: createQuestionLogicDtos.map((dto) => ({
        questionId: dto.questionId,
        conditionType: dto.conditionType,
        conditionValue: dto.conditionValue,
        logicalOperator: dto.logicalOperator || 'AND',
        jumpToQuestionId: dto.jumpToQuestionId,
      })),
    });
  }

  async getQuestionLogicById(id: number): Promise<QuestionLogic | null> {
    const questionLogic = await this.prisma.questionLogic.findUnique({
      where: { id },
    });
    return new QuestionLogic(questionLogic);
  }

  async getQuestionLogicsByQuestionId(
    questionId: number,
  ): Promise<QuestionLogic[]> {
    const questionLogics = await this.prisma.questionLogic.findMany({
      where: { questionId },
    });
    return questionLogics.map(
      (questionLogic) => new QuestionLogic(questionLogic),
    );
  }

  async updateQuestionLogic(
    id: number,
    updateQuestionLogicDto: CreateQuestionLogicDto,
  ): Promise<QuestionLogic> {
    const questionLogic = await this.prisma.questionLogic.update({
      where: { id },
      data: {
        questionId: updateQuestionLogicDto.questionId,
        conditionType: updateQuestionLogicDto.conditionType as ConditionType,
        conditionValue: updateQuestionLogicDto.conditionValue,
        logicalOperator: updateQuestionLogicDto.logicalOperator || 'AND',
        jumpToQuestionId: updateQuestionLogicDto.jumpToQuestionId,
      },
    });
    return new QuestionLogic(questionLogic);
  }

  async deleteQuestionLogic(id: number) {
    return this.prisma.questionLogic.delete({
      where: { id },
    });
  }

  async deleteQuestionLogicsByQuestionId(
    questionId: number,
  ): Promise<{ count: number }> {
    return this.prisma.questionLogic.deleteMany({
      where: { questionId },
    });
  }
}
