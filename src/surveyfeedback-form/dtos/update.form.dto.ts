import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { FormStatus } from 'src/surveyfeedback-form/entities/enums/FormStatus';
import { UpdateFormEndingDto } from './update.form.ending.dto';
import { Type } from 'class-transformer';
import { UpdateFormSettingDto } from './update.form.setting.dto';

export class UpdatesurveyFeedbackDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  allowAnonymous?: boolean;

  @IsOptional()
  @IsEnum(FormStatus)
  status?: FormStatus;

  @Type(() => UpdateFormEndingDto)
  ending?: UpdateFormEndingDto;

  @Type(() => UpdateFormSettingDto)
  settings?: UpdateFormSettingDto[];
}
