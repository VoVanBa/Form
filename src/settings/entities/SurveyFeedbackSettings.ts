import { BusinessSurveyFeedbackSettings } from './BusinessSurveyFeedbackSettings';
import { SettingTypes } from './SettingTypes';

export class SurveyFeedbackSettings {
  id: number;
  key: string;
  value: any;
  label: string;
  description: string;
  formSettingId: number;
  formId: number;
  businessId: number;
  formSettingTypes: SettingTypes;
  businessSurveyFeedbackSettings: BusinessSurveyFeedbackSettings[];

  constructor(data: any) {
    this.id = data.id ?? 0;
    this.key = data.key ?? '';
    this.value = data.value ?? {};
    this.label = data.label ?? '';
    this.description = data.description ?? '';
    this.formSettingId = data.formSettingId ?? 0;
    this.formId = data.formId ?? 0;
    this.businessId = data.businessId ?? 0;
    this.formSettingTypes = data.formSettingTypes
      ? new SettingTypes(data.formSettingTypes)
      : new SettingTypes({});
    this.businessSurveyFeedbackSettings = Array.isArray(
      data.businessSurveyFeedbackSettings,
    )
      ? data.businessSurveyFeedbackSettings.map(
          (b) => new BusinessSurveyFeedbackSettings(b),
        )
      : [];
  }
}
