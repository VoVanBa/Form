import { FormStatus, SurveyFeedbackType } from '@prisma/client';

export class CreateFormDto {
  name: string;
  description?: string;
  createdBy: string;
  type: SurveyFeedbackType;
  allowAnonymous: boolean;
  status: FormStatus;
  businessId: number;
}
