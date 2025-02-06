import { Media } from './Media';
import { AnswerOption } from './AnswerOption';

export interface AnswerOptionOnMedia {
  id: number;
  answerOptionId: number;
  mediaId: number;
  media: Media;
  answerOption: AnswerOption;
}
