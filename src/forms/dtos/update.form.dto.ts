import { FormStatus, SurveyFeedbackType } from '@prisma/client';

export class UpdateFormDto {
  name?: string;
  description?: string;
  type?: SurveyFeedbackType;
  allowAnonymous?: boolean;
  status?: FormStatus;
}
