import { AnswerOptionOnMedia } from './AnswerOptionOnMedia';
import { QuestionOnMedia } from './QuestionOnMedia';

export class Media {
  id: number;
  url: string;
  fileName: string;
  miniType: string;
  size: number;

  createdAt: Date;
  answerOptionOnMedia?: AnswerOptionOnMedia;
  questionOnMedia?: QuestionOnMedia;

  constructor(data: Partial<Media>) {
    Object.assign(this, data);
  }
}
