import { BusinessSurveyFeedbackSettings, Question } from '@prisma/client';
import { Expose } from 'class-transformer';

export class SurveyFeedbackResponse {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  createdBy: string;

  @Expose()
  isOpen: boolean;

  @Expose()
  type: string;

  @Expose()
  allowAnonymous: boolean;

  @Expose()
  status: string;
}
