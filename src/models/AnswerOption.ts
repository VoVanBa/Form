import { AnswerOptionOnMedia, ResponseOnQuestion } from '@prisma/client';
import { Expose } from 'class-transformer';

export class AnswerOption {
  @Expose()
  id: number;
  @Expose()
  label: string;
  @Expose()
  index: number;
  @Expose()
  description: string;
  @Expose()
  questionId: number;
  @Expose()
  answerOptionOnMedia: AnswerOptionOnMedia[];
  @Expose()
  responseOnQuestions: ResponseOnQuestion[];
  constructor(
    id: number,
    label: string,
    index: number,
    questionId: number,
    answerOptionOnMedia: AnswerOptionOnMedia[],
    description: string,
    responseOnQuestions: ResponseOnQuestion[],
  ) {
    this.id = id;
    this.label = label;
    this.index = index;
    this.questionId = questionId;
    this.answerOptionOnMedia = answerOptionOnMedia;
    this.description = description;
    this.responseOnQuestions = responseOnQuestions;
  }
}
