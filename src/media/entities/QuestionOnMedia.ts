import { Media } from './Media';
import { Question } from '../../question/entities/Question';

export class QuestionOnMedia {
  id: number;
  questionId?: number;
  mediaId: number;
  media: Media;
  question?: Question;

  constructor(data: any) {
    this.id = data.id;
    this.questionId = data.questionId;
    this.mediaId = data.mediaId;
    this.media = data.media;
    this.question = data.question;
  }
}
