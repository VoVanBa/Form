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
import { CreateQuestionConditionDto } from 'src/question-condition/dtos/create-question-condition-dto';

export class UpdateQuestionDto extends BaseQuestionDto {
  @IsNotEmpty()
  @IsInt()
  questionId: number;

  // Thêm trường conditions để hỗ trợ cập nhật QuestionCondition
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionConditionDto)
  @IsOptional()
  conditions?: CreateQuestionConditionDto[];
}
