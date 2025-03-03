import { Question } from './Question';
import { QuestionLogic } from './QuestionLogic';
import { QuestionRole } from './enums/QuestionRole';

export class QuestionCondition {
  id: number;
  questionId: number;
  questionLogicId: number;
  role: QuestionRole;
  question: Question;
  questionLogic: QuestionLogic;

  constructor(
    id: number,
    questionId: number,
    questionLogicId: number,
    role: QuestionRole,
    question?: Question,
    questionLogic?: QuestionLogic,
  ) {
    this.id = id;
    this.questionId = questionId;
    this.questionLogicId = questionLogicId;
    this.role = role;
    this.question = question;
    this.questionLogic = questionLogic;
  }

  static fromPrisma(data: any): QuestionCondition {
    return new QuestionCondition(
      data.id,
      data.questionId,
      data.questionLogicId,
      data.role,
      data.question ? Question.fromPrisma(data.question) : undefined,
      data.questionLogic
        ? QuestionLogic.fromPrisma(data.questionLogic)
        : undefined,
    );
  }
}
