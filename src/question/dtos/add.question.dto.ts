import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { QuestionType } from '@prisma/client';
import { AddAnswerOptionDto } from './add.answer.option.dto';

export class AddQuestionDto {
  @IsString()
  @IsNotEmpty()
  headline: string;

  @IsNotEmpty()
  questionType: QuestionType;

  @IsOptional()
  imageId?: number;

  questionId?: number;

  key: string;
  settings?: any;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AddAnswerOptionDto)
  answerOptions?: AddAnswerOptionDto[];

  @IsOptional()
  @IsInt()
  range?: number;

  @IsOptional()
  @IsString()
  lowerLabel?: string;

  @IsOptional()
  @IsString()
  upperLabel?: string;
}
