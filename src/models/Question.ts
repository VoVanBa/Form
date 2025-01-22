import { IAnswerOption } from './AnswerOption';
import { IBusinessQuestionConfiguration } from './BusinessQuestionConfiguration';
import { QuestionType } from './enums/QuestionType';
import { IQuestionOnMedia } from './QuestionOnMedia';
import { IResponseOnQuestion } from './ResponseOnQuestion';
import { ISurveyFeedback } from './SurveyFeedback';

export interface IQuestion {
  id: number;
  headline: string;
  questionType: QuestionType;
  formId: number;
  index: number;
  isDeleted: boolean;
  answerOptions: IAnswerOption[];
  responseOnQuestions: IResponseOnQuestion[];
  form: ISurveyFeedback;
  questionOnMedia: IQuestionOnMedia[];
  businessQuestionConfiguration: IBusinessQuestionConfiguration[];
}
