import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';

import { BaseQuestionDto } from './base.question.dto';
import { CreateQuestionLogicDto } from './create-question-condition-dto';

export class AddQuestionDto extends BaseQuestionDto {
  @IsOptional()
  questionId?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionLogicDto)
  conditions?: CreateQuestionLogicDto[];
}
