import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AddAnswerOptionDto {
  businessId: number;

  answerOptionId?: number;

  @IsOptional()
  label: string;

  @IsOptional()
  @IsInt()
  value?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  imageIds?: number;
}
