import { AnswerOptionOnMedia } from '@prisma/client';

export class AnswerOption {
  id: number;
  label: string;
  index: number;
  questionId: number;
  answerOptionOnMedia: AnswerOptionOnMedia[];

  constructor(
    id: number,
    label: string,
    index: number,
    questionId: number,
    answerOptionOnMedia: AnswerOptionOnMedia[],
  ) {
    this.id = id;
    this.label = label;
    this.index = index;
    this.questionId = questionId;
    this.answerOptionOnMedia = answerOptionOnMedia;
  }
}
