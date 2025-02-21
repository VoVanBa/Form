import { ConditionType } from './enums/ConditionType';
import { LogicalOperator } from './enums/LogicalOperator';
import { Question } from './Question';
export class QuestionCondition {
  id: number;
  targetQuestionId: number;
  sourceQuestionId: number;
  conditionType: ConditionType;
  conditionValue: any;
  logicalOperator: LogicalOperator;
  targetQuestion: Question;
  sourceQuestion: Question;

  constructor(
    id: number,
    targetQuestionId: number,
    sourceQuestionId: number,
    conditionType: ConditionType,
    conditionValue: any,
    logicalOperator: LogicalOperator = LogicalOperator.AND,
    targetQuestion?: Question,
    sourceQuestion?: Question,
  ) {
    this.id = id;
    this.targetQuestionId = targetQuestionId;
    this.sourceQuestionId = sourceQuestionId;
    this.conditionType = conditionType;
    this.conditionValue = conditionValue;
    this.logicalOperator = logicalOperator;
    this.targetQuestion = targetQuestion;
    this.sourceQuestion = sourceQuestion;
  }

  static fromPrisma(data: any): QuestionCondition {
    return new QuestionCondition(
      data.id,
      data.targetQuestionId,
      data.sourceQuestionId,
      data.conditionType,
      data.conditionValue,
      data.logicalOperator,
      data.targetQuestion,
      data.sourceQuestion,
    );
  }
}
