import { FormStatus, SurveyFeedbackType } from '@prisma/client';

export class UpdatesurveyFeedbackDto {
  name?: string;
  description?: string;
  type?: SurveyFeedbackType;
  allowAnonymous?: boolean;
  status?: FormStatus;
}
