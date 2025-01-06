import { IsInt, IsString, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class FeedbackQuestionDto {
  @IsInt()
  questionId: number;

  @IsString()
  answer: string;
}

export class FeedbackDto {
  @IsArray()
  @Type(() => FeedbackQuestionDto)
  questions: FeedbackQuestionDto[];

  @IsInt()
  @Type(() => Number)
  feedbackTypeId: number;

  @IsArray()
  @IsOptional()
  @Type(() => Number)
  mediaIds?: number[];
}
