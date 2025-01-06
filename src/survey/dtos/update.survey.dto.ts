import { QuestionType } from '@prisma/client';

export class UpdateSurveyDto {
  name?: string;
  createdBy?: string;
  surveyStatusId?: number;
  questions?: {
    id?: number;
    headline: string;
    questionType: QuestionType;
    required: boolean;
    answerOptions?: {
      id?: number;
      label: string;
    }[];
  }[];
}
