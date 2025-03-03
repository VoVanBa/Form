import { ConditionType } from './enums/ConditionType';
import { LogicalOperator } from './enums/LogicalOperator';
import { QuestionCondition } from './QuestionCondition';

export class QuestionLogic {
  id: number;
  conditionType: ConditionType;
  conditionValue: any;
  logicalOperator: LogicalOperator;
  conditions: QuestionCondition[];

  constructor(
    id: number,
    conditionType: ConditionType,
    conditionValue: any,
    logicalOperator: LogicalOperator = LogicalOperator.AND,
    conditions: QuestionCondition[] = [],
  ) {
    this.id = id;
    this.conditionType = conditionType;
    this.conditionValue = conditionValue;
    this.logicalOperator = logicalOperator;
    this.conditions = conditions;
  }

  static fromPrisma(data: any): QuestionLogic {
    return new QuestionLogic(
      data.id,
      data.conditionType,
      data.conditionValue,
      data.logicalOperator,
      data.conditions ? data.conditions.map(QuestionCondition.fromPrisma) : [],
    );
  }
}
