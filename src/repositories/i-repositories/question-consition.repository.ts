import { QuestionCondition } from 'src/models/QuestionCondition';
import { CreateQuestionConditionDto } from 'src/question-condition/dtos/create-question-condition-dto';
import { UpdateQuestionConditionDto } from 'src/question-condition/dtos/update-question-condition-dto';

export interface IQuestionConditionRepository {
  findById(
    targetQuestionId: number,
    sourceQuestionId: number,
  ): Promise<QuestionCondition | null>;
  findByTargetQuestionId(targetQuestionId: number): Promise<QuestionCondition[]>;
  findBySourceQuestionId(sourceQuestionId: number): Promise<QuestionCondition[]>;
  create(data: CreateQuestionConditionDto): Promise<QuestionCondition>;
  update(
    id: number,
    data: UpdateQuestionConditionDto,
  ): Promise<QuestionCondition>;
  delete(id: number): Promise<void>;
}
