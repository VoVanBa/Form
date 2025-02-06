import { Expose } from 'class-transformer';

export interface BusinessQuestionConfiguration {
  id: number;

  key: string;

  value: any;

  label: string | null;

  description: string | null;

  formSettingTypesId: number | null;
}
