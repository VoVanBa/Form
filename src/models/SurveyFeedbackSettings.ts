import { BusinessSurveyFeedbackSettings } from './BusinessSurveyFeedbackSettings';
import { SettingTypes } from './SettingTypes';

export class SurveyFeedbackSettings {
  id: number;
  key: string;
  value: object;
  label?: string;
  description?: string;
  formSettingTypesId?: number;
  formSettingTypes?: SettingTypes;
  BusinessSurveyFeedbackSettings: BusinessSurveyFeedbackSettings[];

  constructor(data: Partial<SurveyFeedbackSettings>) {
    Object.assign(this, data);
  }
}
