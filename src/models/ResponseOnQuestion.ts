import { IAnswerOption } from './AnswerOption';
import { IQuestion } from './Question';
import { ISurveyFeedback } from './SurveyFeedback';
import { IUserOnResponse } from './UserOnResponse';

export interface IResponseOnQuestion {
  id: number;
  useronResponseId: number;
  questionId: number;
  formId: number;
  answerOptionId?: number;
  answerText?: string;
  ratingValue?: number;
  answerOption?: IAnswerOption;
  question: IQuestion;
  userResponse?: IUserOnResponse;
  form: ISurveyFeedback;
}
