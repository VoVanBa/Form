// survey-feedback-response.ts
import { Expose, Type } from 'class-transformer';

export class AnswerOptionResponse {
  @Expose()
  answerOptionId: number;

  @Expose()
  value: string;
}

export class QuestionResponse {
  @Expose()
  questionId: number;

  @Expose()
  headline: string;

  @Expose()
  questionType: string;

  @Expose()
  @Type(() => AnswerOptionResponse)
  answerOptions: AnswerOptionResponse[];

  @Expose()
  answerText: string | null;

  @Expose()
  ratingValue: number | null;
}

export class GuestResponse {
  @Expose()
  name: string;

  @Expose()
  address: string;

  @Expose()
  phoneNumber: string;
}

export class UserResponse {
  @Expose()
  userId: number | null;

  @Expose()
  guest: GuestResponse;

  @Expose()
  @Type(() => QuestionResponse)
  responseOnQuestions: QuestionResponse[];
}

export class SurveyResponse {
  @Expose()
  formId: number;

  @Expose()
  @Type(() => UserResponse)
  userResponses: UserResponse[];
}
