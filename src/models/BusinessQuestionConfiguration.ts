import { Expose } from 'class-transformer';

export class BusinessQuestionConfiguration {
  @Expose()
  id: number;
  @Expose()
  key: string;
  @Expose()
  value: any;
  @Expose()
  label: string | null;
  @Expose()
  description: string | null;
  @Expose()
  formSettingTypesId: number | null;

  constructor(
    id: number,
    key: string,
    value: any,
    label: string | null,
    description: string | null,
    formSettingTypesId: number | null,
  ) {
    this.id = id;
    this.key = key;
    this.value = value;
    this.label = label;
    this.description = description;
    this.formSettingTypesId = formSettingTypesId;
  }
}
