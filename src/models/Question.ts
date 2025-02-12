import { QuestionOnMedia } from './QuestionOnMedia';
import { AnswerOption } from './AnswerOption';
import { BusinessQuestionConfiguration } from './BusinessQuestionConfiguration';
import { ResponseOnQuestion } from './ResponseOnQuestion';
import { SurveyFeedback } from './SurveyFeedback';
import { QuestionType } from '@prisma/client';

export class Question {
  id: number;
  headline: string;
  questionType: QuestionType;
  index: number;
  formId: number;
  deletedAt: Date;
  questionOnMedia: QuestionOnMedia;
  answerOptions: AnswerOption[];
  businessQuestionConfiguration: BusinessQuestionConfiguration;
  responseOnQuestions: ResponseOnQuestion[];
  form: SurveyFeedback;
  constructor(data: Partial<Question>) {
    Object.assign(this, data);
  }
}
