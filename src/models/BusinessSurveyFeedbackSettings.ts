import { Business } from './Business';
import { SurveyFeedback } from './SurveyFeedback';
import { SurveyFeedbackSettings } from './SurveyFeedbackSettings';

export class BusinessSurveyFeedbackSettings {
  id: number;

  key: string;

  value: any;

  formSetting: SurveyFeedbackSettings;

  business: Business;

  form: SurveyFeedback;

  formSettingId: number;

  constructor(data: Partial<BusinessSurveyFeedbackSettings>) {  
    Object.assign(this, data);
  } 
}
