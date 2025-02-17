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
import { BaseQuestionDto } from './base.question.dto';

export class AddQuestionDto extends BaseQuestionDto{
  @IsOptional()
  questionId?: number;
}
