import { User } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

export class MediaResponse {
  @Expose()
  url: string;
}

export class AnswerOptionResponse {
  @Expose()
  answerOptionId: number;

  @Expose()
  label: string;

  @Expose()
  @Type(() => AnswerOptionOnMediaResponse)
  mediaUrl: AnswerOptionOnMediaResponse[];
}

export class AnswerOptionOnMediaResponse {
  @Expose()
  @Type(() => MediaResponse)
  media: MediaResponse;
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
  username: string | null;

  @Expose()
  email: string | null;

  @Expose()
  guest: GuestResponse;

  @Expose()
  user: User;

  @Expose()
  sentAt: Date;

  @Expose()
  @Type(() => QuestionResponse)
  responseOnQuestions: QuestionResponse[];
}

export class FormResponse {
  @Expose()
  formId: number;

  @Expose()
  @Type(() => UserResponse)
  userResponses: UserResponse[];
}
