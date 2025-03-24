import {
  IsInt,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConditionType } from '../entities/enums/ConditionType';
import { LogicalOperator } from '../entities/enums/LogicalOperator';
import { ActionType } from '../entities/enums/ActionType';

export class CreateQuestionLogicDto {
  @IsInt()
  @IsNotEmpty()
  questionId: number;

  @IsEnum(ConditionType)
  conditionType: ConditionType;

  @IsNotEmpty()
  conditionValue: any; // JSON chứa điều kiện (cần validate kỹ hơn trong service)

  @IsEnum(LogicalOperator)
  @IsOptional()
  logicalOperator?: LogicalOperator;

  @IsEnum(ActionType)
  @IsNotEmpty()
  actionType: ActionType;

  @IsInt()
  @IsOptional()
  jumpToQuestionId?: number;
}
