import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAnswerOptionDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsOptional()
  @IsInt()
  value?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  image?: Express.Multer.File;
}
