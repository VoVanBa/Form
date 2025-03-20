import { QuestionOnMedia } from 'src/media/entities/QuestionOnMedia';

export interface QuestionMediaRepository {
  createQuestionOnMedia(data: {
    mediaId: number;
    questionId: number;
  }): Promise<QuestionOnMedia>;
  updateQuestionOnMedia(
    questionId: number,
    mediaId: number,
  ): Promise<QuestionOnMedia>;
  getQuestionOnMediaByMediaId(mediaId: number): Promise<QuestionOnMedia | null>;
  getQuestionOnMediaByQuestionId(
    questionId: number,
  ): Promise<QuestionOnMedia | null>;
}
