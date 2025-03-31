import { AddAnswerOptionDto } from 'src/answer-option/dtos/add.answer.option.dto';
import { AnswerOption } from 'src/answer-option/entities/AnswerOption';

export interface AnswerOptionRepository {
  createAnswerOptions(
    questionId: number,
    answerOptions: AddAnswerOptionDto,
    index: number,
    tx?: any,
  ): Promise<AnswerOption>;

  getQuantityAnserOptionbyQuestionId(
    questionId: number,
    tx?: any,
  ): Promise<number>;

  getAllAnserOptionbyQuestionId(
    questionId: number,
    tx?: any,
  ): Promise<AnswerOption[]>;

  deleteAnwserOption(id: number, questionId: number): Promise<any>;

  findanswerOptionsByQuestionId(questionId: number): Promise<any[]>;

  updateAnswerOptions(
    answerOptionId: number,
    data: AddAnswerOptionDto,
    tx?: any,
  ): Promise<AnswerOption>;
}
