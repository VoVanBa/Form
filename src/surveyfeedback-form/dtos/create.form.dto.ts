import { FormStatus, SurveyFeedbackType } from '@prisma/client';

export class CreatesurveyFeedbackDto {
  name: string;
  description?: string;
  createdBy: string;
  type: SurveyFeedbackType;
  allowAnonymous: boolean;
  status: FormStatus;
}
