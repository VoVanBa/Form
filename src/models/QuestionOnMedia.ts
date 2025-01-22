import { IMedia } from './Media';
import { IQuestion } from './Question';

export interface IQuestionOnMedia {
  id: number;
  mediaId: number;
  questionId?: number;
  media: IMedia;
  question?: IQuestion;
}
