import { IsEnum, IsInt, IsJSON, IsOptional } from 'class-validator';
import { ConditionType } from 'src/models/enums/ConditionType';
import { LogicalOperator } from 'src/models/enums/LogicalOperator';
import { QuestionRole } from 'src/models/enums/QuestionRole';

export class QuestionConditionBaseDto {
  @IsInt()
  questionId: number;

  @IsEnum(QuestionRole)
  @IsOptional()
  role: QuestionRole;

  @IsEnum(ConditionType)
  @IsOptional()
  conditionType?: ConditionType;

  @IsInt()
  @IsOptional()
  sourceQuestionId?: number; // Thêm trường này

  @IsInt()
  @IsOptional()
  targetQuestionId?: number; // Thêm trường này

  @IsJSON()
  @IsOptional()
  conditionValue?: any;

  @IsEnum(LogicalOperator)
  @IsOptional()
  logicalOperator?: LogicalOperator;
}
