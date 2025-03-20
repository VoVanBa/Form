import { AnswerOptionOnMedia } from 'src/media/entities/AnswerOptionOnMedia';

export interface AnswerOptionMediaRepository {
  updateAnswerOptionOnMedia(
    mediaId: number,
    answerOptionId: number,
  ): Promise<void>;

  getAnswerOptionByAnswerOptionId(
    answerOptionId: number,
  ): Promise<AnswerOptionOnMedia | null>;
  createAnswerOptionOnMedia(
    data: { mediaId: number; answerOptionId: number | null }[],
  ): Promise<AnswerOptionOnMedia[]>;
}
