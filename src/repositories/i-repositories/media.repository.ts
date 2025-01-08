import { Media, QuestionOnMedia } from '@prisma/client';

export interface IMediaRepository {
  createMedia(
    url: string,
    fileName: string,
    mimeType: string,
    size: number,
  ): Promise<Media>;
  getMediaById(id: number): Promise<Media | null>;
  updateMedia(id: number, media: Partial<Media>): Promise<Media>;
  deleteMediaById(id: number): Promise<void>;
  getQuestionOnMediaByMediaId(mediaId: number): Promise<QuestionOnMedia | null>;
  updateQuestionOnMedia(questionId: number, mediaId: number)
  updateAnswerOptionOnMedia(
    mediaId: number,
    answerOptionId: number,
  ): Promise<any>;
}
