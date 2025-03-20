import { QuestionRole } from './enums/QuestionRole';
import { Question } from './Question';
import { QuestionLogic } from './QuestionLogic';

export class QuestionCondition {
  id: number;
  questionId: number;
  questionLogicId: number;
  role: QuestionRole;
  question?: Question;
  questionLogic?: QuestionLogic;

  constructor(data: any) {
    this.id = data.id ?? 0;
    this.questionId = data.questionId ?? 0;
    this.questionLogicId = data.questionLogicId ?? 0;
    this.role = data.role ?? QuestionRole.SOURCE;
    this.question = data.question ? new Question(data.question) : undefined;
    this.questionLogic = data.questionLogic
      ? new QuestionLogic(data.questionLogic)
      : undefined;
  }
}
