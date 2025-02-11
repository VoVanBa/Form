export class ResponseDto {
  id: string;
  label: string;
  count: number;
  percentage: string;
  media?: string;
}

export class QuestionResponseDto {
  questionId: string;
  type: string;
  headline: string;
  media?: string;
  responses: ResponseDto[] | { answerText: string }[];
  totalQuestionResponses: number;
}

export class GetFormRateDto {
  totalResponses: number;
  questions: QuestionResponseDto[];
}
