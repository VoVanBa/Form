import { SurveySettingKey } from './enums/SurveySettingKey';

export class SurveyFeedbackSettings {
  id: number;
  formId: number;
  businessId: number;
  key: SurveySettingKey;
  value: any;
  isEnabled: boolean;
  business: any;
  form: any;

  constructor(data: any) {
    this.id = data.id ?? 0;
    this.formId = data.formId ?? 0;
    this.businessId = data.businessId ?? 0;
    this.key = data.key ?? '';
    this.value = data.value ?? {};
    this.isEnabled = data.isEnabled ?? false;
    this.business = data.business ?? null;
    this.form = data.form ?? null;
  }
}
