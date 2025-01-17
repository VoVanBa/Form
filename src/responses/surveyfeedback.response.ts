import { Expose, Type } from 'class-transformer';

export class MediaResponse {
  @Expose()
  id: number;

  @Expose()
  url: string;
}

export class AnswerOptionMedia {
  @Expose()
  @Type(() => MediaResponse)
  media: MediaResponse;
}

export class QuestionMedia {
  @Expose()
  @Type(() => MediaResponse)
  media: MediaResponse;
}

export class AnswerOptionResponse {
  @Expose()
  id: number;

  @Expose()
  label: string;

  @Expose()
  sortOrder?: number;

  @Expose()
  description?: string;

  @Expose()
  @Type(() => AnswerOptionMedia)
  answerOptionOnMedia: AnswerOptionMedia[];
}

export class QuestionResponse {
  @Expose()
  id: number;

  @Expose()
  headline: string;

  @Expose()
  questionType: string;

  @Expose()
  index: number;

  @Expose()
  @Type(() => QuestionMedia)
  questionOnMedia: QuestionMedia[];

  @Expose()
  @Type(() => AnswerOptionResponse)
  answerOptions: AnswerOptionResponse[];

  @Expose()
  @Type(() => QuestionConfig)
  businessQuestionConfiguration: QuestionConfig[];
}

export class QuestionConfig {
  @Expose()
  settings: object;
}

export class SurveyFeedbackResponse {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  isOpen: boolean;

  @Expose()
  type: string;

  @Expose()
  allowAnonymous: boolean;

  @Expose()
  status: string;

  @Expose()
  @Type(() => QuestionResponse)
  questions: QuestionResponse[];
}
