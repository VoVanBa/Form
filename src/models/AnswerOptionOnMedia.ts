import { Media } from './Media';
import { AnswerOption } from './AnswerOption';

export class AnswerOptionOnMedia {
  id: number;
  answerOptionId: number;
  mediaId: number;
  media: Media;
  answerOption: AnswerOption;

  constructor(data: Partial<AnswerOptionOnMedia>) {
    Object.assign(this, data);
  }
}
