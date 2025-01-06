import { Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { FeedbackResponseQuestionDto } from './feedback.response.question.dto';

export class CreateFeedbackResponseDto {
  @IsInt()
  feedbackFormId: number;

  businessId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeedbackResponseQuestionDto)
  questions: FeedbackResponseQuestionDto[];
}
