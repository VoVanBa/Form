import { IsInt } from 'class-validator';
import { CreateQuestionLogicDto } from './create-question-condition-dto';

export class UpdateQuestionLogicDto extends CreateQuestionLogicDto {
  @IsInt()
  id: number;
}
