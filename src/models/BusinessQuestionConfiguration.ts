import { Question } from './Question';
import { SurveyFeedback } from './SurveyFeedback';

export class BusinessQuestionConfiguration {
  id: number;

  questionId: number;

  formId: number;
  key: string;

  settings: any;

  question: Question;

  form: SurveyFeedback;
  constructor(data: Partial<BusinessQuestionConfiguration>) {
    Object.assign(this, data);
  }
}
