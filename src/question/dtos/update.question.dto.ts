import { IsInt, IsNotEmpty } from 'class-validator';

import { BaseQuestionDto } from './base.question.dto';

export class UpdateQuestionDto extends BaseQuestionDto {
  @IsNotEmpty()
  @IsInt()
  questionId: number;
}
