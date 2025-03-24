import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsJSON, IsObject, IsString } from 'class-validator';
import { SurveySettingKey } from '../entities/enums/SurveySettingKey';

export class SurveyFeedbackSettingsDto {
  @IsInt()
  @Type(() => Number)
  id: number;

  @IsInt()
  @Type(() => Number)
  formId: number;

  @IsInt()
  @Type(() => Number)
  businessId: number;

  @IsString()
  key: SurveySettingKey;

  @IsJSON()
  value: any;

  @IsBoolean()
  isEnabled: boolean;
}

export class UpdateSettingDto {
  @IsInt()
  @Type(() => Number)
  id: number;

  @IsString()
  key: SurveySettingKey;

  @IsJSON()
  value: any;

  @IsBoolean()
  isEnabled: boolean;
}
