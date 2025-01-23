import { Media } from "@prisma/client";

export class AnswerOptionOnMedia {
  id: number;
  answerOptionId: number;
  mediaId: number;
  media: Media;

  constructor(
    id: number,
    answerOptionId: number,
    mediaId: number,
    media: Media,
  ) {
    this.id = id;
    this.answerOptionId = answerOptionId;
    this.mediaId = mediaId;
    this.media = media;
  }
}