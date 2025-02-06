import { BusinessSurveyFeedbackSettings } from './BusinessSurveyFeedbackSettings';
import { SettingTypes } from './SettingTypes';

export interface SurveyFeedbackSettings {
  id: number;
  key: string;
  value: object;
  label?: string;
  description?: string;
  formSettingTypesId?: number;
  formSettingTypes?: SettingTypes;
  BusinessSurveyFeedbackSettings: BusinessSurveyFeedbackSettings[];
}
