import { BusinessSurveyFeedbackSettings, SettingTypes } from "@prisma/client";

export class SurveyFeedbackSettings {
  id: number;
  key: string;
  value: object;
  label?: string;
  description?: string;
  formSettingTypesId?: number;
  formSettingTypes?: SettingTypes;
  BusinessSurveyFeedbackSettings: BusinessSurveyFeedbackSettings[];

  constructor(
    id: number,
    key: string,
    value: object,
    label: string | undefined,
    description: string | undefined,
    formSettingTypesId: number | undefined,
    formSettingTypes: SettingTypes | undefined,
    BusinessSurveyFeedbackSettings: BusinessSurveyFeedbackSettings[],
  ) {
    this.id = id;
    this.key = key;
    this.value = value;
    this.label = label;
    this.description = description;
    this.formSettingTypesId = formSettingTypesId;
    this.formSettingTypes = formSettingTypes;
    this.BusinessSurveyFeedbackSettings = BusinessSurveyFeedbackSettings;
  }
}
