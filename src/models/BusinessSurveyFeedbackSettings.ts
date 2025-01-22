import { IBusiness } from './Business';
import { ISurveyFeedback } from './SurveyFeedback';
import { ISurveyFeedbackSettings } from './SurveyFeedbackSettings';

export interface IBusinessSurveyFeedbackSettings {
  id: number;
  businessId: number;
  formId: number;
  key: string;
  value: object;
  formSettingId: number;
  formSetting: ISurveyFeedbackSettings;
  business: IBusiness;
  form: ISurveyFeedback;
}
