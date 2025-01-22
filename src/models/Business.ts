import { IBusinessSurveyFeedbackSettings } from './BusinessSurveyFeedbackSettings';
import { ISurveyFeedback } from './SurveyFeedback';
import { IUser } from './User';

export interface IBusiness {
  id: number;
  name: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  user: IUser;
  businessSurveySettings: IBusinessSurveyFeedbackSettings[];
  forms: ISurveyFeedback[];
}
