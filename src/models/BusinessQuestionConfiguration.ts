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

  static fromPrisma(data: any): BusinessQuestionConfiguration {
    if (!data) return null;
    return new BusinessQuestionConfiguration({
      id: data.id,
      questionId: data.questionId,
      formId: data.formId,
      key: data.key,
      settings: data.settings,
      question: data.question ? Question.fromPrisma(data.question) : null,
      form: data.form ? SurveyFeedback.fromPrisma(data.form) : null,
    });
  }
}
