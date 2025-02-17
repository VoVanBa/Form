import { SurveyFeedbackSettings } from './SurveyFeedbackSettings';

export class SettingTypes {
  id: number;

  name: string;

  description: string;

  settings: SurveyFeedbackSettings[];

  constructor(data: Partial<SettingTypes>) {
    Object.assign(this, data);
  }
  static fromPrisma(data: any): SettingTypes {
    if (!data) return null;
    return new SettingTypes({
      id: data.id,
      name: data.name,
      description: data.description,
      settings: data.settings
        ? data.settings.map(SurveyFeedbackSettings.fromPrisma)
        : [],
    });
  }
}
