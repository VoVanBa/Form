export class BusinessQuestionConfiguration {
  id: number;
  key: string;
  value: any;
  label: string | null;
  description: string | null;
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
