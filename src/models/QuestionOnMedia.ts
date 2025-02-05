import { Media, Question } from '@prisma/client';
import { Expose } from 'class-transformer';

export class QuestionOnMedia {
  @Expose()
  id: number;
  @Expose()
  questionId: number;
  @Expose()
  mediaId: number;
  @Expose()
  media: Media;
  @Expose()
  question: Question;
  constructor(id: number, questionId: number, mediaId: number, media: Media) {
    this.id = id;
    this.questionId = questionId;
    this.mediaId = mediaId;
    this.media = media;
    this.question = this.question;
  }
}
