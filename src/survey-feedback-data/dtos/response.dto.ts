import { QuestionType } from '@prisma/client';
import {
  IsInt,
  IsOptional,
  IsArray,
  IsObject,
  IsString,
} from 'class-validator';
export class ResponseDto {
  @IsInt()
  questionId: number;

  questionType: QuestionType;

  @IsOptional()
  @IsInt()
  answerOptionId?: number[];

  @IsOptional()
  @IsString()
  answerText?: string;

  @IsOptional()
  @IsInt()
  ratingValue?: number;
}
