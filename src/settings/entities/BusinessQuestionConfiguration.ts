import { Question } from 'src/question/entities/Question';
import { SurveyFeedback } from 'src/surveyfeedback-form/entities/SurveyFeedback';

export class BusinessQuestionConfiguration {
  id: number;
  questionId: number;
  formId: number;
  key: string;
  settings: any;
  question: Question;
  form: SurveyFeedback;

  constructor(data: any) {
    this.id = data.id ?? 0;
    this.questionId = data.questionId ?? 0;
    this.formId = data.formId ?? 0;
    this.key = data.key ?? '';
    this.settings = data.settings ?? {};
    this.question = data.question ? new Question(data.question) : undefined;
    this.form = data.form ? new SurveyFeedback(data.form) : undefined;
  }
}
