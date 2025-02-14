import { BusinessSurveyFeedbackSettings } from './BusinessSurveyFeedbackSettings';
import { SettingTypes } from './SettingTypes';

export class SurveyFeedbackSettings {
  id: number;

  key: string;

  value: any;

  formSettingId: number;

  formId: number;

  businessId: number;

  formSettingTypes: SettingTypes;

  businessSurveyFeedbackSettings: BusinessSurveyFeedbackSettings[];

  constructor(data: Partial<SurveyFeedbackSettings>) {
    Object.assign(this, data);
  }
}
