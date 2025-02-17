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

  static fromPrisma(data: any): BusinessSurveyFeedbackSettings {
    if (!data) return null;
    return new BusinessSurveyFeedbackSettings({
      id: data.id,
      key: data.key,
      value: data.value,
      formId: data.formId,
      formSettingId: data.formSettingId,
      businessId: data.businessId,
      formSetting: data.formSetting
        ? SurveyFeedbackSettings.fromPrisma(data.formSetting)
        : null,
      business: data.business ? Business.fromPrisma(data.business) : null,
      form: data.form ? SurveyFeedback.fromPrisma(data.form) : null,
    });
  }
}
