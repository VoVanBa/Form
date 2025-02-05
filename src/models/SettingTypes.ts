import { SurveyFeedbackSettings } from '@prisma/client';
import { Expose } from 'class-transformer';

export class SettingTypes {
  @Expose()
  id: number;
  @Expose()
  name: string;
  @Expose()
  description: string;
  @Expose()
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
