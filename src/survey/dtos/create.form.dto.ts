import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateSurveyOnQuestionDto } from './create.survey.on.question.dto';

export class CreateFormDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @IsBoolean()
  @IsOptional()
  allowAnonymous?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  isTemplate: boolean;

  @ValidateNested({ each: true })
  @Type(() => CreateSurveyOnQuestionDto)
  surveyOnQuestions?: CreateSurveyOnQuestionDto[];
}
