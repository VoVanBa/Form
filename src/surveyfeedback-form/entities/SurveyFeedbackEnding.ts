import { Media } from 'src/media/entities/Media';

export class SurveyFeedbackEnding {
  id: number;
  surveyId: number;
  message: string;
  redirectUrl?: string;
  mediaId?: number;
  media?: Media;

  constructor(data: any) {
    this.id = data.id ?? 0;
    this.surveyId = data.surveyId ?? 0;
    this.message = data.message ?? '';
    this.redirectUrl = data.redirectUrl ?? undefined;
    this.mediaId = data.mediaId ?? undefined;
    this.media = data.media ? new Media(data.media) : undefined;
  }
}
