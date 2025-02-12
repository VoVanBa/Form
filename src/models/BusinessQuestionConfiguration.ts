import { Expose } from 'class-transformer';

export class BusinessQuestionConfiguration {
  id: number;

  key: string;

  value: any;

  label: string | null;

  description: string | null;

  formSettingTypesId: number | null;

  constructor(data: Partial<BusinessQuestionConfiguration>) {
    Object.assign(this, data);
  }
}
