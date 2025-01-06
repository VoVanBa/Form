import { QuestionType } from '@prisma/client';
import { AddAnswerOptionDto } from 'src/question/dtos/add.answer.option.dto';

export interface CreateFeedbackTemplateDto {
  title: string;
  description: string;
  createdBy: number;
  feedbackOnQuestions: {
    headline: string;
    required: boolean;
    questionType: QuestionType;
    answerOptions: AddAnswerOptionDto[];
  }[];
}
