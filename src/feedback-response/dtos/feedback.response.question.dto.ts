import { IsInt, IsOptional, IsString } from 'class-validator';

export class FeedbackResponseQuestionDto {
  @IsInt()
  questionId: number;

  @IsOptional()
  @IsInt()
  answerOptionId?: number;

  @IsOptional()
  @IsString()
  selectedAnswerText?: string;

  @IsOptional()
  @IsInt()
  ratingValue?: number;
}
