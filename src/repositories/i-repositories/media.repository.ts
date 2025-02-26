import { Media } from 'src/models/Media';
import { QuestionOnMedia } from 'src/models/QuestionOnMedia';

export interface IMediaRepository {
  createMedia(
    url: string,
    fileName: string,
    mimeType: string,
    size: number,
    tx?: any,
  ): Promise<Partial<Media>>;

  getMediaById(id: number, tx?: any): Promise<Partial<Media> | null>;

  deleteMediaById(id: number, tx?: any): Promise<void>;

  getQuestionOnMediaByMediaId(
    mediaId: number,
    tx?: any,
  ): Promise<Partial<QuestionOnMedia> | null>;

  updateQuestionOnMedia(
    questionId: number,
    mediaId: number,
    tx?: any,
  ): Promise<any>;

  updateAnswerOptionOnMedia(
    mediaId: number,
    answerOptionId: number,
    tx?: any,
  ): Promise<any>;

  getAnswerOptionByAnswerOptionId(
    answerOptionId: number,
    tx?: any,
  ): Promise<any>;

  getQuestionOnMediaByQuestionId(questionId: number, tx?: any): Promise<any>;

  createQuestionOnMedia(
    data: { mediaId: number; questionId: number },
    tx?: any,
  ): Promise<Partial<QuestionOnMedia>>; // Added missing method

  createAnswerOptionOnMedia(
    data: { mediaId: number; answerOptionId: number | null }[],
    tx?: any,
  ): Promise<any>; // Added missing method
}
