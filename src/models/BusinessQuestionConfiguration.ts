import { IQuestion } from './Question';
import { ISurveyFeedback } from './SurveyFeedback';

export interface IBusinessQuestionConfiguration {
  id: number;
  questionId: number;
  formId: number;
  key: string;
  settings: object;
  question: IQuestion;
  form: ISurveyFeedback;
}
