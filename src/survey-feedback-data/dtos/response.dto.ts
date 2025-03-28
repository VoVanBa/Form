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

  @IsOptional()
  // @IsInt()
  answerOptionId?: number | number[];

  @IsOptional()
  @IsString()
  answerText?: string;

  @IsOptional()
  @IsInt()
  ratingValue?: number;

  @IsOptional()
  @IsString()
  otherAnswer?: string;
}
