import { QuestionType } from '@prisma/client';
import {
  IsInt,
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { AddAnswerOptionDto } from './add.answer.option.dto';
import { Type } from 'class-transformer';

export class UpdateQuestionDto {
  formId: number;
  @IsString()
  @IsOptional()
  headline?: string;

  questionId: number;

  @IsString()
  questionType: QuestionType;

  @IsArray()
  @IsOptional()
  answerOptions?: string[];

  @IsInt()
  @IsOptional()
  imageId?: number;

  @IsString()
  @IsOptional()
  scaleType?: string;

  @IsInt()
  @IsOptional()
  range?: number;

  @IsString()
  @IsOptional()
  lowerLabel?: string;

  @IsString()
  @IsOptional()
  upperLabel?: string;

  settings: any;

  // @IsOptional()
  // @ValidateNested({ each: true })
  // @Type(() => AddAnswerOptionDto)
  // answerOptions?: AddAnswerOptionDto[];
}
