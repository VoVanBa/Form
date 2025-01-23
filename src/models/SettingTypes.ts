import { SurveyFeedbackSettings } from '@prisma/client';

export class SettingTypes {
  id: number;
  name: string;
  description: string;
  settings: SurveyFeedbackSettings[];

  constructor(
    id: number,
    name: string,
    description: string,
    settings: SurveyFeedbackSettings[],
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.settings = settings;
  }
}
