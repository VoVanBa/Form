import { Media } from './Media';
import { Question } from './Question';

export class QuestionOnMedia {
  id: number;

  questionId: number;

  mediaId: number;

  media: Media;

  question?: Question;

  constructor(data: Partial<QuestionOnMedia>) {
    Object.assign(this, data);
  }

  static fromPrisma(data: any): QuestionOnMedia {
    if (!data) return null;
    return new QuestionOnMedia({
      id: data.id,
      questionId: data.questionId,
      mediaId: data.mediaId,
      media: data.media ? Media.fromPrisma(data.media) : null,
      question: data.question ? Question.fromPrisma(data.question) : null,
    });
  }
}
