import { Media } from './Media';
import { Question } from './Question';

export interface QuestionOnMedia {
  id: number;

  questionId: number;

  mediaId: number;

  media: Media;

  question: Question;
}
