import { SurveyFeedbackSettings } from './SurveyFeedbackSettings';

export class SettingTypes {
  id: number;
  name: string;
  description: string;
  settings: SurveyFeedbackSettings[];

  constructor(data: any) {
    this.id = data.id ?? 0;
    this.name = data.name ?? '';
    this.description = data.description ?? '';
    this.settings = Array.isArray(data.settings)
      ? data.settings.map((setting) => new SurveyFeedbackSettings(setting))
      : [];
  }
}
