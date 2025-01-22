import { IResponseOnQuestion } from './ResponseOnQuestion';
import { ISurveyFeedback } from './SurveyFeedback';
import { IUser } from './User';

export interface IUserOnResponse {
  id: number;
  formId: number;
  userId?: number;
  guest?: object;
  sentAt: Date;
  responseOnQuestions: IResponseOnQuestion[];
  form: ISurveyFeedback;
  user?: IUser;
}
