import { ConditionType } from '../entities/enums/ConditionType';
import { LogicalOperator } from '../entities/enums/LogicalOperator';

export class CreateQuestionLogicDto {
  questionId: number;
  conditionType: ConditionType;
  conditionValue: any; // JSON data containing dependentQuestionId and condition value
  logicalOperator?: LogicalOperator;
  jumpToQuestionId?: number;
}
