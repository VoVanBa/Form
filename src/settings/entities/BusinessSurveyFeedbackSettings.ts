import { Business } from 'src/business/entities/Business';
import { SurveyFeedback } from 'src/surveyfeedback-form/entities/SurveyFeedback';
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

  constructor(data: any) {
    this.id = data.id ?? 0;
    this.key = data.key ?? '';
    this.value = data.value ?? {};
    this.formId = data.formId ?? 0;
    this.formSettingId = data.formSettingId ?? 0;
    this.businessId = data.businessId ?? 0;
    this.formSetting = data.formSetting
      ? new SurveyFeedbackSettings(data.formSetting)
      : undefined;
    this.business = data.business ? new Business(data.business) : undefined;
    this.form = data.form ? new SurveyFeedback(data.form) : undefined;
  }
}
