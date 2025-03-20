import { IsEnum, IsInt, IsJSON, IsOptional } from 'class-validator';
import { ConditionType } from 'src/question/entities/enums/ConditionType';
import { LogicalOperator } from 'src/question/entities/enums/LogicalOperator';
import { QuestionRole } from 'src/question/entities/enums/QuestionRole';

export class QuestionConditionBaseDto {
  @IsInt()
  questionId: number;

  @IsEnum(QuestionRole)
  @IsOptional()
  role: QuestionRole;

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
