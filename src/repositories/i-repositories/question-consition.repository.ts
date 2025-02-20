import { QuestionCondition } from 'src/models/QuestionCondition';

export interface IQuestionConditionRepository {
  findById(id: number): Promise<QuestionCondition | null>;
  findByTargetQuestionId(
    targetQuestionId: number,
  ): Promise<QuestionCondition[]>;
  findBySourceQuestionId(
    sourceQuestionId: number,
  ): Promise<QuestionCondition[]>;
//   create(data: CreateQuestionConditionDto): Promise<QuestionCondition>;
//   update(
//     id: number,
//     data: UpdateQuestionConditionDto,
//   ): Promise<QuestionCondition>;
//   delete(id: number): Promise<void>;
}
