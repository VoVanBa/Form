import { BusinessSurveyFeedbackSettings } from './BusinessSurveyFeedbackSettings';
import { SurveyFeedback } from './SurveyFeedback';
import { User } from './User';

export class Business {
  id: number;

  name: string;
  address: string;

  createdAt: Date;

  updatedAt: Date;

  userId: number;

  user: User;

  businessSurveySettings: BusinessSurveyFeedbackSettings[];

  forms: SurveyFeedback[];

  constructor(data: Partial<Business>) {
    Object.assign(this, data);
  }
}
