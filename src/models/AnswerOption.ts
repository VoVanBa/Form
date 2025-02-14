import { AnswerOptionOnMedia } from './AnswerOptionOnMedia';
import { Question } from './Question';
import { ResponseOnQuestion } from './ResponseOnQuestion';

export class AnswerOption {
  id: number;
  label: string;
  index: number;
  description: string;
  questionId: number;
  answerOptionOnMedia?: AnswerOptionOnMedia;
  responseOnQuestions: ResponseOnQuestion[];

  question: Question;

  constructor(data: Partial<AnswerOption>) {
    Object.assign(this, data);
  }
}
