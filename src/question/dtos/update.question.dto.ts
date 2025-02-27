import {
  IsInt,
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { AddAnswerOptionDto } from '../../answer-option/dtos/add.answer.option.dto';
import { Type } from 'class-transformer';
import { QuestionType } from 'src/models/enums/QuestionType';
import { BaseQuestionDto } from './base.question.dto';

export class UpdateQuestionDto extends BaseQuestionDto {
  @IsNotEmpty()
  @IsInt()
  questionId: number;
}
