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

  static fromPrisma(data: any): SurveyFeedbackSettings {
    if (!data) return null;
    return new SurveyFeedbackSettings({
      id: data.id,
      key: data.key,
      value: data.value,
      formSettingId: data.formSettingId,
      formId: data.formId,
      businessId: data.businessId,
      formSettingTypes: data.formSettingTypes,
      businessSurveyFeedbackSettings: data.businessSurveyFeedbackSettings
        ? data.businessSurveyFeedbackSettings.map(
            BusinessSurveyFeedbackSettings.fromPrisma,
          )
        : [],
    });
  }
}
