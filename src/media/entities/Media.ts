import { SurveyFeedbackEnding } from 'src/surveyfeedback-form/entities/SurveyFeedbackEnding';
import { AnswerOptionOnMedia } from './AnswerOptionOnMedia';
import { QuestionOnMedia } from './QuestionOnMedia';

export class Media {
  id: number;
  url: string;
  fileName: string;
  miniType: string;
  size: number;
  createdAt: Date;
  answerOptionOnMedia?: AnswerOptionOnMedia[];
  questionOnMedia?: QuestionOnMedia[];
  surveyFeedbackEnding: SurveyFeedbackEnding[];

  constructor(data: any) {
    this.id = data.id ?? 0;
    this.url = data.url ?? '';
    this.fileName = data.fileName ?? '';
    this.miniType = data.miniType ?? '';
    this.size = data.size ?? 0;
    this.createdAt = data.createdAt ?? new Date();
    this.answerOptionOnMedia = Array.isArray(data.answerOptionOnMedia)
      ? data.answerOptionOnMedia.map((aom) => new AnswerOptionOnMedia(aom))
      : [];
    this.questionOnMedia = Array.isArray(data.questionOnMedia)
      ? data.questionOnMedia.map((qom) => new QuestionOnMedia(qom))
      : [];
    this.surveyFeedbackEnding = Array.isArray(data.surveyFeedbackEnding)
      ? data.surveyFeedbackEnding.map((sfe) => new SurveyFeedbackEnding(sfe))
      : [];
  }
}
