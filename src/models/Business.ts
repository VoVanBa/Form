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

  static fromPrisma(data: any): Business {
    if (!data) return null;
    return new Business({
      id: data.id,
      name: data.name,
      address: data.address,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      userId: data.userId,
      user: data.user ? User.fromPrisma(data.user) : null,
      businessSurveySettings: data.businessSurveySettings
        ? data.businessSurveySettings.map((setting: any) =>
            BusinessSurveyFeedbackSettings.fromPrisma(setting),
          )
        : [],
      forms: data.forms
        ? data.forms.map((form: any) => SurveyFeedback.fromPrisma(form))
        : [],
    });
  }
}
