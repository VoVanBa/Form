import { QuestionLogic } from '@prisma/client';
import { CreateQuestionLogicDto } from 'src/question/dtos/create-question-condition-dto';
import { UpdateQuestionLogicDto } from 'src/question/dtos/update-question-condition-dto';

export interface IQuestionConditionRepository {
  findById(
    targetQuestionId: number,
    sourceQuestionId: number,
  ): Promise<any | null>;
  findByTargetQuestionId(targetQuestionId: number): Promise<any[]>;
  findBySourceQuestionId(sourceQuestionId: number): Promise<any[]>;
  create(data: CreateQuestionLogicDto, questionLogicId: number): Promise<any>;
  update(id: number, data: UpdateQuestionLogicDto): Promise<any>;
  delete(id: number): Promise<void>;

  getQuestionSourceById(questionId: number): Promise<QuestionLogic>;
}
