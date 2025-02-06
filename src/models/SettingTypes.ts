import { SurveyFeedbackSettings } from './SurveyFeedbackSettings';

export interface SettingTypes {
  id: number;

  name: string;

  description: string;

  settings: SurveyFeedbackSettings[];
}
