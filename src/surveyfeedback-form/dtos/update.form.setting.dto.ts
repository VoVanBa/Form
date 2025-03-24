import { IsOptional, IsEnum } from 'class-validator';
import { SurveySettingKey } from 'src/settings/entities/enums/SurveySettingKey';

export type SurveySettingValue =
  | boolean // SHOW_ONLY_ONCE, EMAIL_NOTIFICATION...
  | number // CLOSE_ON_RESPONSE_LIMIT
  | string // POSITION
  | Date; // RELEASE_ON_DATE, CLOSE_ON_DATE

export interface SurveySetting {
  key: SurveySettingKey;
  value: SurveySettingValue;
}

export class UpdateFormSettingDto {
  @IsOptional()
  @IsEnum(SurveySettingKey)
  key?: SurveySettingKey;

  @IsOptional()
  value?: SurveySettingValue; // Chỉ cần giá trị chứ không phải cả object SurveySetting
}
