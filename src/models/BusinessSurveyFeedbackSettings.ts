import { Business } from './Business';
import { SurveyFeedback } from './SurveyFeedback';
import { SurveyFeedbackSettings } from './SurveyFeedbackSettings';

export class BusinessSurveyFeedbackSettings {
  id: number;

  key: string;

  value: any;

  formId: number;
  formSettingId: number;
  businessId: number;
  formSetting: SurveyFeedbackSettings;

  business: Business;

  form: SurveyFeedback;

  constructor(data: Partial<BusinessSurveyFeedbackSettings>) {
    Object.assign(this, data);
  }
}
