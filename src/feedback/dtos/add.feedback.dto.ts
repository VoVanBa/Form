import { QuestionType } from '@prisma/client';
import { AddAnswerOptionDto } from './add.answer.option.dto';

export class AddFeedbackDto {
  headline: string;
  required: boolean;
  description?: string;
  questionType: QuestionType;
  answerOptions?: AddAnswerOptionDto[];
  imageId?: number;
  businessId: number;
  userId: number; // Assuming you have userId in DTO
  questionId?: number;
}
