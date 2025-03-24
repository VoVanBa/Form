import { ConditionType } from './enums/ConditionType';
import { LogicalOperator } from './enums/LogicalOperator';
import { Question } from './Question';

export class QuestionLogic {
  id: number;
  questionId: number; // ID của câu hỏi áp dụng logic
  conditionType: ConditionType;
  conditionValue: any; // Chứa dependentQuestionId + giá trị điều kiện
  logicalOperator: LogicalOperator;
  jumpToQuestionId?: number | null; // Câu hỏi đích (có thể null)
  question?: Question | null; // Liên kết với câu hỏi

  constructor(data: any) {
    this.id = data.id ?? 0;
    this.questionId = data.questionId ?? 0;
    this.conditionType = data.conditionType ?? ConditionType.EQUALS;
    this.conditionValue = data.conditionValue ?? null;
    this.logicalOperator = data.logicalOperator ?? LogicalOperator.AND;
    this.jumpToQuestionId = data.jumpToQuestionId ?? null;
    this.question = data.question ?? null;
  }
}
