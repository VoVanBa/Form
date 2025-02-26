import { FormStatus } from 'src/models/enums/FormStatus';

export class UpdatesurveyFeedbackDto {
  name?: string;
  description?: string;
  allowAnonymous?: boolean;
  status?: FormStatus;
  endingMessage?: string;

  endingRedirectUrl?: string;

  endingMediaId?: number;
}
