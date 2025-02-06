import { Business } from './Business';
import { SurveyFeedback } from './SurveyFeedback';
import { SurveyFeedbackSettings } from './SurveyFeedbackSettings';

export interface BusinessSurveyFeedbackSettings {
  id: number;

  key: string;

  value: any;

  formSetting: SurveyFeedbackSettings;

  business: Business;

  form: SurveyFeedback;

  formSettingId: number;
}
