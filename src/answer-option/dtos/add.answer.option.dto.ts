import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AddAnswerOptionDto {
  businessId?: number;

  answerOptionId?: number;

  @IsOptional()
  label: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  imageIds?: number;
}
