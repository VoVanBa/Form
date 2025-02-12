import { SurveyFeedbackSettings } from './SurveyFeedbackSettings';

export class SettingTypes {
  id: number;

  name: string;

  description: string;

  settings: SurveyFeedbackSettings[];

  constructor(data: Partial<SettingTypes>) {
    Object.assign(this, data);
  }
}
