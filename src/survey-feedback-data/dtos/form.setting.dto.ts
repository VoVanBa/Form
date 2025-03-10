export class FormSettingDto {
  key: string;
  settings: {
    enabled?: boolean;
    limit?: number;
    date?: string | null;
    position?: string;
  };
}
