import { IsInt, IsString, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionConfigurationDto {
  @IsInt()
  @Type(() => Number)
  id: number;

  @IsInt()
  @Type(() => Number)
  questionId: number;

  @IsInt()
  @Type(() => Number)
  formId: number;

  @IsString()
  key: string;

  @IsObject()
  settings: any;
}
