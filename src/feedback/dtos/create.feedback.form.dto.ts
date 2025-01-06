import { User } from '@prisma/client';

export interface CreateFeedbackFormDto {
  title: string;
  description: string;
}
