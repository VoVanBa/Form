import { AnswerOption } from './AnswerOption';
import { Question } from './Question';
import { SurveyFeedback } from './SurveyFeedback';
import { UserOnResponse } from './UserOnResponse';

export interface ResponseOnQuestion {
  id: number;

  useronResponseId: number;

  questionId: number;

  formId: number;

  answerOptionId: number | null;

  answerText: string | null;

  ratingValue: number | null;

  answerOption: AnswerOption | null;

  question: Question;

  userResponse: UserOnResponse;

  form: SurveyFeedback;
}
