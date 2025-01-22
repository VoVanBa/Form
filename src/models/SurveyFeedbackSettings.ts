import { IBusinessSurveyFeedbackSettings } from './BusinessSurveyFeedbackSettings';
import { ISettingTypes } from './SettingTypes';

export interface ISurveyFeedbackSettings {
  id: number;
  key: string;
  value: object;
  label?: string;
  description?: string;
  formSettingTypesId?: number;
  formSettingTypes?: ISettingTypes;
  BusinessSurveyFeedbackSettings: IBusinessSurveyFeedbackSettings[];
}
