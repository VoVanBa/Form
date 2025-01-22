import { IAnswerOptionOnMedia } from './AnswerOptionOnMedia';
import { IQuestionOnMedia } from './QuestionOnMedia';

export interface IMedia {
  id: number;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  answerOptionOnMedia: IAnswerOptionOnMedia[];
  questionOnMedia: IQuestionOnMedia[];
}
