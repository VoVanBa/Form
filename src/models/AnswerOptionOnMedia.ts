import { AnswerOption, Media } from '@prisma/client';
import { Expose } from 'class-transformer';

export class AnswerOptionOnMedia {
  @Expose()
  id: number;
  @Expose()
  answerOptionId: number;
  @Expose()
  mediaId: number;
  @Expose()
  media: Media;
  @Expose()
  answerOption: AnswerOption;

  constructor(
    id: number,
    answerOptionId: number,
    mediaId: number,
    media: Media,
    answerOption: AnswerOption,
  ) {
    this.id = id;
    this.answerOptionId = answerOptionId;
    this.mediaId = mediaId;
    this.media = media;
    this.answerOption = answerOption;
  }
}
