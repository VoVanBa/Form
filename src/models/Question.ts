import { QuestionOnMedia } from './QuestionOnMedia';
import { AnswerOption } from './AnswerOption';
import { BusinessQuestionConfiguration } from './BusinessQuestionConfiguration';
import { ResponseOnQuestion } from './ResponseOnQuestion';
import { SurveyFeedback } from './SurveyFeedback';
import { QuestionType } from './enums/QuestionType';
import { isArray } from 'class-validator';

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

  static fromPrisma(data: any): Question {
    if (!data) return null;
    console.log(data.responseOnQuestions, ' data ansseroption');
    return new Question({
      id: data.id,
      headline: data.headline,
      questionType: data.questionType,
      formId: data.formId,
      index: data.index,
      deletedAt: data.deletedAt || null,
      answerOptions: isArray(data.answerOptions)
        ? data.answerOptions.map(AnswerOption.fromPrisma)
        : [],
      responseOnQuestions: isArray(data.responseOnQuestions)
        ? data.responseOnQuestions.map(ResponseOnQuestion.fromPrisma)
        : [],
      form: data.form ? SurveyFeedback.fromPrisma(data.form) : null,
      questionOnMedia: data.questionOnMedia
        ? QuestionOnMedia.fromPrisma(data.questionOnMedia)
        : null,
      businessQuestionConfiguration: data.businessQuestionConfiguration
        ? BusinessQuestionConfiguration.fromPrisma(
            data.businessQuestionConfiguration,
          )
        : null,
    });
  }
}
