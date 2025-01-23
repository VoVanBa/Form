import { AnswerOption, QuestionOnMedia, QuestionType } from '@prisma/client';
import { BusinessQuestionConfiguration } from './BusinessQuestionConfiguration';

export class Question {
  id: number;
  headline: string;
  questionType: QuestionType;
  index: number;
  formId: number;
  questionOnMedia: QuestionOnMedia[];
  answerOptions: AnswerOption[];
  businessQuestionConfiguration: BusinessQuestionConfiguration[];

  constructor(
    id: number,
    headline: string,
    questionType: QuestionType,
    index: number,
    formId: number,
    questionOnMedia: QuestionOnMedia[],
    answerOptions: AnswerOption[],
    businessQuestionConfiguration: BusinessQuestionConfiguration[],
  ) {
    this.id = id;
    this.headline = headline;
    this.questionType = questionType;
    this.index = index;
    this.formId = formId;
    this.questionOnMedia = questionOnMedia;
    this.answerOptions = answerOptions;
    this.businessQuestionConfiguration = businessQuestionConfiguration;
  }
}
