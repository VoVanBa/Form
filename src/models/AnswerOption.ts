import { IAnswerOptionOnMedia } from './AnswerOptionOnMedia';
import { IQuestion } from './Question';
import { IResponseOnQuestion } from './ResponseOnQuestion';

export interface IAnswerOption {
  id: number;
  questionId: number;
  label?: string;
  isActive: boolean;
  index?: number;
  description?: string;
  question: IQuestion;
  answerOptionOnMedia: IAnswerOptionOnMedia[];
  responseOnQuestions: IResponseOnQuestion[];
}
