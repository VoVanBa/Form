
import { ConditionType } from './enums/ConditionType';
import { LogicalOperator } from './enums/LogicalOperator';
import { QuestionCondition } from './QuestionCondition';

export class QuestionLogic {
  id: number;
  conditionType: ConditionType;
  conditionValue: any;
  logicalOperator: LogicalOperator;
  conditions: QuestionCondition[];

  constructor(data: any) {
    this.id = data.id;
    this.conditionType = data.conditionType;
    this.conditionValue = data.conditionValue;
    this.logicalOperator = data.logicalOperator || LogicalOperator.AND;
    this.conditions = data.conditions
      ? data.conditions.map((c) => new QuestionCondition(c))
      : [];
  }
}
