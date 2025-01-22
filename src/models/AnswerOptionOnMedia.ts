import { IAnswerOption } from './AnswerOption';
import { IMedia } from './Media';

export interface IAnswerOptionOnMedia {
  id: number;
  mediaId: number;
  answerOptionId?: number;
  index?: number;
  answerOption?: IAnswerOption;
  media: IMedia;
}
