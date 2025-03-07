import { IsEnum, IsInt, IsJSON, IsOptional } from 'class-validator';
import { ConditionType } from 'src/models/enums/ConditionType';
import { LogicalOperator } from 'src/models/enums/LogicalOperator';
import { QuestionRole } from 'src/models/enums/QuestionRole';

export class UpdateQuestionConditionDto {
  @IsInt()
  questionLogicId;

  @IsInt()
  questionId?: number;
  
  @IsEnum(QuestionRole)
  role?: QuestionRole;

  @IsEnum(ConditionType)
  @IsOptional()
  conditionType?: ConditionType;

  @IsJSON()
  @IsOptional()
  conditionValue?: any;

  @IsEnum(LogicalOperator)
  @IsOptional()
  logicalOperator?: LogicalOperator;
}
