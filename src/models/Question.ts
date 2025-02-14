import { QuestionOnMedia } from './QuestionOnMedia';
import { AnswerOption } from './AnswerOption';
import { BusinessQuestionConfiguration } from './BusinessQuestionConfiguration';
import { ResponseOnQuestion } from './ResponseOnQuestion';
import { SurveyFeedback } from './SurveyFeedback';
import { QuestionType } from './enums/QuestionType';

export class Question {
  id: number;
  headline: string;
  questionType: QuestionType;
  formId: number;
  index: number;
  deletedAt?: Date;
  answerOptions?: AnswerOption[];
  responseOnQuestions?: ResponseOnQuestion[];
  form?: SurveyFeedback;
  questionOnMedia?: QuestionOnMedia;
  businessQuestionConfiguration?: BusinessQuestionConfiguration;

  constructor(data: Partial<Question>) {
    Object.assign(this, data);
  }

  /**
   * Ánh xạ dữ liệu từ Prisma sang model này.
   */
  static fromPrisma(data: any): Question {
    if (!data) return null;
    return new Question({
      id: data.id,
      headline: data.headline,
      questionType: data.questionType,
      formId: data.formId,
      index: data.index,
      deletedAt: data.deletedAt || null,
      answerOptions: data.answerOptions || [],
      responseOnQuestions: data.responseOnQuestions || [],
      form: data.form ? SurveyFeedback.fromPrisma(data.form) : null,
      questionOnMedia: data.questionOnMedia || null,
      businessQuestionConfiguration: data.businessQuestionConfiguration || null,
    });
  }
}
