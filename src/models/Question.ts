import { QuestionOnMedia } from './QuestionOnMedia';
import { AnswerOption } from './AnswerOption';
import { BusinessQuestionConfiguration } from './BusinessQuestionConfiguration';
import { ResponseOnQuestion } from './ResponseOnQuestion';
import { SurveyFeedback } from './SurveyFeedback';
import { QuestionType } from './enums/QuestionType';

export interface Question {
  id: number;
  headline: string;
  questionType: QuestionType;
  index: number;
  formId: number;
  isDeleted: boolean;
  questionOnMedia: QuestionOnMedia[];
  answerOptions: AnswerOption[];
  businessQuestionConfiguration: BusinessQuestionConfiguration[];
  responseOnQuestions: ResponseOnQuestion[];
  form: SurveyFeedback;
}
