import { ConditionType } from './enums/ConditionType';
import { LogicalOperator } from './enums/LogicalOperator';
import { ActionType } from './enums/ActionType';
import { Question } from './Question';

export class QuestionLogic {
  id: number;
  questionId: number;
  conditionType: ConditionType;
  conditionValue: any; // JSON chứa dependentQuestionId + giá trị điều kiện
  logicalOperator: LogicalOperator;
  actionType: ActionType;
  jumpToQuestionId?: number | null;
  sourceQuestion?: Question | null; // Câu hỏi nguồn áp dụng logic
  targetQuestion?: Question | null; // Câu hỏi đích khi JUMP

  constructor(data: any) {
    this.id = data.id ?? 0;
    this.questionId = data.questionId ?? 0;
    this.conditionType = data.conditionType ?? ConditionType.EQUALS;
    this.conditionValue = data.conditionValue ?? null;
    this.logicalOperator = data.logicalOperator ?? LogicalOperator.AND;
    this.actionType = data.actionType ?? ActionType.JUMP;
    this.jumpToQuestionId = data.jumpToQuestionId ?? null;
    this.sourceQuestion = data.sourceQuestion ?? null;
    this.targetQuestion = data.targetQuestion ?? null;
  }
}
