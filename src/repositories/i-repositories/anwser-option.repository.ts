import { AnswerOption } from 'src/models/AnswerOption';
import { AddAnswerOptionDto } from 'src/question/dtos/add.answer.option.dto';

export interface AnswerOptionRepository {
  createAnswerOptions(
    questionId: number,
    answerOptions: AddAnswerOptionDto,
    index: number,
  ): Promise<AnswerOption>;
  getQuantityAnserOptionbyQuestionId(questionId: number);
  getAllAnserOptionbyQuestionId(questionId: number);
  deleteAnserOption(ids: number, questionId: number);
  findanswerOptionsByQuestionId(questionId);
}
