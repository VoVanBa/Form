import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

import { BaseQuestionDto } from './base.question.dto';

export class AddQuestionDto extends BaseQuestionDto {
  @IsOptional()
  questionId?: number;
}
