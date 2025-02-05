import {
  AnswerOption,
  BusinessQuestionConfiguration,
  QuestionType,
  ResponseOnQuestion,
  SurveyFeedback,
} from '@prisma/client';
import { QuestionOnMedia } from './QuestionOnMedia';
import { Expose } from 'class-transformer';

export class Question {
  id: number;
  @Expose()
  headline: string;
  @Expose()
  questionType: QuestionType;
  @Expose()
  index: number;
  @Expose()
  formId: number;
  @Expose()
  isDeleted: Boolean;
  @Expose()
  questionOnMedia: QuestionOnMedia[];
  @Expose()
  answerOptions: AnswerOption[];
  @Expose()
  businessQuestionConfiguration: BusinessQuestionConfiguration[];
  @Expose()
  responseOnQuestions: ResponseOnQuestion[];
  @Expose()
  form: SurveyFeedback;

  constructor(
    id: number,
    headline: string,
    questionType: QuestionType,
    index: number,
    formId: number,
    isDeleted: boolean,
    questionOnMedia: QuestionOnMedia[],
    answerOptions: AnswerOption[],
    businessQuestionConfiguration: BusinessQuestionConfiguration[],
    responseOnQuestions: ResponseOnQuestion[],
    form: SurveyFeedback,
  ) {
    this.id = id;
    this.headline = headline;
    this.questionType = questionType;
    this.index = index;
    this.formId = formId;
    this.isDeleted = isDeleted;
    this.questionOnMedia = questionOnMedia;
    this.answerOptions = answerOptions;
    this.businessQuestionConfiguration = businessQuestionConfiguration;
    this.responseOnQuestions = responseOnQuestions;
    this.form = form;
  }
}
