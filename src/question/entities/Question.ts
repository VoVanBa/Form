import { QuestionOnMedia } from '../../media/entities/QuestionOnMedia';
import { ResponseOnQuestion } from '../../models/ResponseOnQuestion';
import { SurveyFeedback } from '../../surveyfeedback-form/entities/SurveyFeedback';
import { QuestionType } from './enums/QuestionType';
import { isArray } from 'class-validator';
import { AnswerOption } from 'src/answer-option/entities/AnswerOption';
import { QuestionLogic } from './QuestionLogic';
import { QuestionConfiguration } from 'src/settings/entities/QuestionConfiguration';

export class Question {
  id: number;
  headline: string;
  questionType: QuestionType;
  formId: number;
  index: number;
  deletedAt?: Date | null;
  answerOptions?: AnswerOption[];
  responseOnQuestions?: ResponseOnQuestion[];
  form?: SurveyFeedback;
  questionOnMedia?: QuestionOnMedia;
  questionConfiguration?: QuestionConfiguration;
  sourceLogics?: QuestionLogic[]; // Logic từ câu hỏi này
  targetLogics?: QuestionLogic[]; // Logic áp dụng lên câu hỏi này

  constructor(data: any) {
    this.id = data.id;
    this.headline = data.headline;
    this.questionType = data.questionType;
    this.formId = data.formId;
    this.index = data.index;
    this.deletedAt = data.deletedAt ?? null;
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
    this.questionConfiguration = data.questionConfiguration
      ? new QuestionConfiguration(data.questionConfiguration)
      : null;
    this.sourceLogics = isArray(data.sourceLogics)
      ? data.sourceLogics.map((item) => new QuestionLogic(item))
      : [];
    this.targetLogics = isArray(data.targetLogics)
      ? data.targetLogics.map((item) => new QuestionLogic(item))
      : [];
  }
}
