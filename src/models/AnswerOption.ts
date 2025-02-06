import { AnswerOptionOnMedia } from './AnswerOptionOnMedia';
import { ResponseOnQuestion } from './ResponseOnQuestion';

export interface AnswerOption {
  id: number;
  label: string;
  index: number;
  description: string;
  questionId: number;
  answerOptionOnMedia: AnswerOptionOnMedia[];
  responseOnQuestions: ResponseOnQuestion[];
}
