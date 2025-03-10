import { AnswerOptionOnMedia } from './AnswerOptionOnMedia';
import { QuestionOnMedia } from './QuestionOnMedia';

export class Media {
  id: number;
  url: string;
  fileName: string;
  miniType: string;
  size: number;

  createdAt: Date;
  answerOptionOnMedia?: AnswerOptionOnMedia[];
  questionOnMedia?: QuestionOnMedia[];

  constructor(data: Partial<Media>) {
    Object.assign(this, data);
  }
  static fromPrisma(data: any): Media {
    if (!data) return null;
    return new Media({
      id: data.id,
      url: data.url,
      fileName: data.fileName,
      miniType: data.miniType,
      size: data.size,
      createdAt: data.createdAt,
      answerOptionOnMedia: data.answerOptionOnMedia
        ? data.answerOptionOnMedia.map((aom: any) => AnswerOptionOnMedia.fromPrisma(aom))
        : null,
      questionOnMedia: data.questionOnMedia
        ? data.questionOnMedia.map((qom: any) => QuestionOnMedia.fromPrisma(qom))
        : null,
    });
  }
}
