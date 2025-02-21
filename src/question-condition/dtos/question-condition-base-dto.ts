import { IsEnum, IsInt, IsJSON, IsOptional } from 'class-validator';
import { ConditionType } from 'src/models/enums/ConditionType';
import { LogicalOperator } from 'src/models/enums/LogicalOperator';

export class QuestionConditionBaseDto {
  @IsInt()
  targetQuestionId: number;

  @IsInt()
  sourceQuestionId: number;

  @IsEnum(ConditionType)
  conditionType: ConditionType;

  conditionValue: any;

  @IsEnum(LogicalOperator)
  @IsOptional()
  logicalOperator?: LogicalOperator;
}
