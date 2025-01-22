import { ISurveyFeedbackSettings } from './SurveyFeedbackSettings';

export interface ISettingTypes {
  id: number;
  name: string;
  description: string;
  settings: ISurveyFeedbackSettings[];
}
