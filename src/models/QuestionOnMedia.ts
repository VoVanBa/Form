import { Media } from '@prisma/client';

export class QuestionOnMedia {
  id: number;
  questionId: number;
  mediaId: number;
  media: Media;

  constructor(id: number, questionId: number, mediaId: number, media: Media) {
    this.id = id;
    this.questionId = questionId;
    this.mediaId = mediaId;
    this.media = media;
  }
}
