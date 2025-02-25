import { Media } from './Media';

export class SurveyFeedbackEnding {
  id: number;
  surveyId: number;
  message: string;
  redirectUrl?: string;
  mediaId?: number;
  media?: Media;

  constructor(data: Partial<SurveyFeedbackEnding>) {
    Object.assign(this, data);
  }

  static fromPrisma(data: any): SurveyFeedbackEnding {
    if (!data) return null;
    return new SurveyFeedbackEnding({
      id: data.id,
      surveyId: data.surveyId,
      message: data.message,
      redirectUrl: data.redirectUrl,
      mediaId: data.mediaId,
      media: data.media ? Media.fromPrisma(data.media) : null,
    });
  }
}
