import { Media } from './Media';
import { Question } from './Question';

export class QuestionOnMedia {
  id: number;

  questionId: number;

  mediaId: number;

  media: Media;

  question: Question;

  constructor(data: Partial<QuestionOnMedia>) {
    Object.assign(this, data);
  }
}
