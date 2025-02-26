import { AnswerOption } from 'src/models/AnswerOption';
import { AddAnswerOptionDto } from 'src/question/dtos/add.answer.option.dto';

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

  deleteAnserOption(id: number, questionId: number, tx?: any): Promise<any>;

  findanswerOptionsByQuestionId(questionId: number, tx?: any): Promise<any[]>;

  updateAnswerOptions(
    answerOptionId: number,
    data: AddAnswerOptionDto,
    tx?: any,
  ): Promise<any>; // Added missing method
}
