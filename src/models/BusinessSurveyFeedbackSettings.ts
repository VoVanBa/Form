import { Business } from './Business';
import { SurveyFeedback } from './SurveyFeedback';
import { BusinessQuestionConfiguration } from './BusinessQuestionConfiguration';

export class BusinessSurveyFeedbackSettings {
  id: number;
  value: any;
  formSetting: BusinessQuestionConfiguration;
  business: Business;
  form: SurveyFeedback;
  formSettingId: number;

  constructor(
    id: number,
    value: any,
    formSetting: BusinessQuestionConfiguration,
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
