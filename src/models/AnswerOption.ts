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

  static fromPrisma(data: any): AnswerOption {
    if (!data) return null;
    return new AnswerOption({
      id: data.id,
      label: data.label,
      index: data.index,
      description: data.description,
      questionId: data.questionId,
      answerOptionOnMedia: data.answerOptionOnMedia || null,
      responseOnQuestions: data.responseOnQuestions || [],
      question: data.question ? Question.fromPrisma(data.question) : null,
    });
  }
}
