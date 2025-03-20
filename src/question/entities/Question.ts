import { QuestionOnMedia } from '../../media/entities/QuestionOnMedia';

import { ResponseOnQuestion } from '../../models/ResponseOnQuestion';
import { SurveyFeedback } from '../../surveyfeedback-form/entities/SurveyFeedback';
import { QuestionType } from './enums/QuestionType';
import { isArray } from 'class-validator';
import { AnswerOption } from 'src/answer-option/entities/AnswerOption';
import { QuestionCondition } from './QuestionCondition';
import { BusinessQuestionConfiguration } from 'src/settings/entities/BusinessQuestionConfiguration';

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
  questionConditions?: QuestionCondition[];

  constructor(data: any) {
    this.id = data.id;
    this.headline = data.headline;
    this.questionType = data.questionType;
    this.formId = data.formId;
    this.index = data.index;
    this.deletedAt = data.deletedAt || null;
    this.answerOptions = isArray(data.answerOptions)
      ? data.answerOptions.map((item) => new AnswerOption(item))
      : [];
    this.responseOnQuestions = isArray(data.responseOnQuestions)
      ? data.responseOnQuestions.map((item) => new ResponseOnQuestion(item))
      : [];
    this.form = data.form ? new SurveyFeedback(data.form) : null;
    this.questionOnMedia = data.questionOnMedia
      ? new QuestionOnMedia(data.questionOnMedia)
      : null;
    this.businessQuestionConfiguration = data.businessQuestionConfiguration
      ? new BusinessQuestionConfiguration(data.businessQuestionConfiguration)
      : null;
    this.questionConditions = isArray(data.questionConditions)
      ? data.questionConditions.map((item) => new QuestionCondition(item))
      : [];
  }
}
