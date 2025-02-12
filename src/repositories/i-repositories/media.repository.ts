import { Media } from 'src/models/Media';
import { QuestionOnMedia } from 'src/models/QuestionOnMedia';

export interface IMediaRepository {
  createMedia(
    url: string,
    fileName: string,
    mimeType: string,
    size: number,
  ): Promise<Partial<Media>>;
  getMediaById(id: number): Promise<Partial<Media> | null>;
  deleteMediaById(id: number): Promise<void>;
  getQuestionOnMediaByMediaId(
    mediaId: number,
  ): Promise<Partial<QuestionOnMedia> | null>;
  updateQuestionOnMedia(questionId: number, mediaId: number);
  updateAnswerOptionOnMedia(
    mediaId: number,
    answerOptionId: number,
  ): Promise<any>;
  getAnswerOptionByAnswerOptionId(answerOptionId: number);
  getQuestionOnMediaByQuestionId(questionId: number);
  updateQuestionOnMedia(questionId: number, mediaId: number);
}
