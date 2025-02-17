import { Media } from './Media';
import { AnswerOption } from './AnswerOption';

export class AnswerOptionOnMedia {
  id: number;
  answerOptionId: number;
  mediaId: number;
  media: Media;
  index: number;
  answerOption?: AnswerOption;

  constructor(data: Partial<AnswerOptionOnMedia>) {
    Object.assign(this, data);
  }

  static fromPrisma(data: any): AnswerOptionOnMedia {
    if (!data) return null;
    return new AnswerOptionOnMedia({
      id: data.id,
      answerOptionId: data.answerOptionId,
      mediaId: data.mediaId,
      media: data.media ? Media.fromPrisma(data.media) : null,
      index: data.index,
      answerOption: data.answerOption
        ? AnswerOption.fromPrisma(data.answerOption)
        : null,
    });
  }
}
