import { LogicalOperator } from '@prisma/client';
import { IsEnum, IsInt, IsJSON, IsOptional } from 'class-validator';
import { ConditionType } from 'src/models/enums/ConditionType';

export class UpdateQuestionConditionDto {
  @IsInt()
  @IsOptional()
  targetQuestionId?: number;

  @IsInt()
  @IsOptional()
  sourceQuestionId?: number;

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
