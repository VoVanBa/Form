import {
  Business,
  SurveyFeedback,
  SurveyFeedbackSettings,
} from '@prisma/client';
import { Expose } from 'class-transformer';

export class BusinessSurveyFeedbackSettings {
  @Expose()
  id: number;
  @Expose()
  key: string;
  @Expose()
  value: any;
  @Expose()
  formSetting: SurveyFeedbackSettings;
  @Expose()
  business: Business;
  @Expose()
  form: SurveyFeedback;
  @Expose()
  formSettingId: number;

  constructor(
    id: number,
    value: any,
    formSetting: SurveyFeedbackSettings,
    business: Business,
    form: SurveyFeedback,
    formSettingId: number,
  ) {
    this.id = id;
    this.value = value;
    this.formSetting = formSetting;
    this.business = business;
    this.form = form;
    this.formSettingId = formSettingId;
  }
}
