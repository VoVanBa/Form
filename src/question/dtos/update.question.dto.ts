import { IsInt, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

import { BaseQuestionDto } from './base.question.dto';
import { Type } from 'class-transformer';
import { UpdateQuestionLogicDto } from './update-question-condition-dto';

export class UpdateQuestionDto extends BaseQuestionDto {
  @IsNotEmpty()
  @IsInt()
  questionId: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionLogicDto)
  conditions?: UpdateQuestionLogicDto[];
}
