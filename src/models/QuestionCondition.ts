import { ConditionType } from './enums/ConditionType';
import { LogicalOperator } from './enums/LogicalOperator';

export class QuestionCondition {
  id: number;
  targetQuestionId: number;
  sourceQuestionId: number;
  conditionType: ConditionType;
  conditionValue: any;
  logicalOperator: LogicalOperator;

  constructor(
    id: number,
    targetQuestionId: number,
    sourceQuestionId: number,
    conditionType: ConditionType,
    conditionValue: any,
    logicalOperator: LogicalOperator = LogicalOperator.AND,
  ) {
    this.id = id;
    this.targetQuestionId = targetQuestionId;
    this.sourceQuestionId = sourceQuestionId;
    this.conditionType = conditionType;
    this.conditionValue = conditionValue;
    this.logicalOperator = logicalOperator;
  }

  static fromPrisma(data: any): QuestionCondition {
    return new QuestionCondition(
      data.id,
      data.targetQuestionId,
      data.sourceQuestionId,
      data.conditionType,
      data.conditionValue,
      data.logicalOperator,
    );
  }
}
