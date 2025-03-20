import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AddAnswerOptionDto } from '../../answer-option/dtos/add.answer.option.dto';
import { QuestionType } from '../entities/enums/QuestionType';
import { CreateQuestionConditionDto } from './create-question-condition-dto';

export class BaseQuestionDto {
  @IsOptional()
  headline: string;

  @IsNotEmpty()
  questionType: QuestionType;

  @IsOptional()
  @IsInt()
  imageId?: number;

  settings?: any; // Có thể tạo interface riêng cho settings

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AddAnswerOptionDto)
  answerOptions?: AddAnswerOptionDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionConditionDto)
  conditions?: CreateQuestionConditionDto[];
}
