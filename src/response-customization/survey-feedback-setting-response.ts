// survey-feedback-response.ts
import { Expose, Type } from 'class-transformer';

export class BusinessSettingResponse {
  @Expose()
  key: string;

  @Expose()
  value: any;
}

export class FormSettingResponse {
  @Expose()
  key: string;

  @Expose()
  value: any;

  @Expose()
  label: string;

  @Expose()
  description: string;

  @Expose()
  @Type(() => BusinessSettingResponse)
  businessSettings: BusinessSettingResponse[];
}

export class FormSettingTypeResponse {
  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  @Type(() => FormSettingResponse)
  settings: FormSettingResponse[];
}
