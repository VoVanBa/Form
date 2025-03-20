import { AnswerOptionOnMedia } from 'src/media/entities/AnswerOptionOnMedia';
import { ResponseOnQuestion } from 'src/models/ResponseOnQuestion';
import { Question } from 'src/question/entities/Question';

export class AnswerOption {
  id: number;
  label: string;
  index: number;
  description: string;
  questionId: number;
  answerOptionOnMedia?: AnswerOptionOnMedia;
  responseOnQuestions: ResponseOnQuestion[];
  question: Question;

  constructor(data: any) {
    this.id = data.id ?? 0;
    this.label = data.label ?? '';
    this.index = data.index ?? 0;
    this.description = data.description ?? '';
    this.questionId = data.questionId ?? 0;
    this.answerOptionOnMedia = data.answerOptionOnMedia
      ? new AnswerOptionOnMedia(data.answerOptionOnMedia)
      : undefined;
    this.responseOnQuestions = Array.isArray(data.responseOnQuestions)
      ? data.responseOnQuestions.map((r) => new ResponseOnQuestion(r))
      : [];
    this.question = data.question ? new Question(data.question) : undefined;
  }
}
