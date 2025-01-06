// dto/update-survey-settings.dto.ts
import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class UpdateSurveySettingsDto {
  @IsString()
  key: string;

  @IsOptional()
  @IsString()
  @IsDateString()
  value: string | boolean | any;
}
