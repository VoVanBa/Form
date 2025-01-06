import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { CreateQuestionDto } from './create.question.dto';

export class CreateSurveyOnQuestionDto {
  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
