import { AnswerOption } from 'src/answer-option/entities/AnswerOption';
import { Media } from './Media';

export class AnswerOptionOnMedia {
  id: number;
  answerOptionId: number;
  mediaId: number;
  media: Media;
  index: number;
  answerOption?: AnswerOption;

  constructor(data: any) {
    this.id = data.id ?? 0;
    this.answerOptionId = data.answerOptionId ?? 0;
    this.mediaId = data.mediaId ?? 0;
    this.media = data.media ? new Media(data.media) : undefined;
    this.index = data.index ?? 0;
    this.answerOption = data.answerOption
      ? new AnswerOption(data.answerOption)
      : undefined;
  }
}
