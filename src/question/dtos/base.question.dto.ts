import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AnswerOption } from 'src/models/AnswerOption';
import { QuestionType } from 'src/models/enums/QuestionType';
import { AddAnswerOptionDto } from './add.answer.option.dto';

export class BaseQuestionDto {
  @IsOptional()
  headline: string;

  @IsNotEmpty()
  questionType: QuestionType;

  @IsOptional()
  @IsInt()
  imageId?: number;

  @IsString()
  key: string;

  settings?: any; // Có thể tạo interface riêng cho settings

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AddAnswerOptionDto)
  answerOptions?: AddAnswerOptionDto[];
}
