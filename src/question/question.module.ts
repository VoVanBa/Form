import { Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { PrismaQuestionRepository } from 'src/repositories/prisma-question.repository';
import { PrismaMediaRepository } from 'src/repositories/prisma-media.repository';
import { PrismaAnswerOptionRepository } from 'src/repositories/prisma-anwser-option.repository';
import { PrismaService } from 'src/config/prisma.service';
import { CloudinaryProvider } from 'src/config/cloudinary.provider';
import { QuestionConditionService } from 'src/question-condition/question-condition.service';
import { PrismaSurveyFeedbackRepository } from 'src/repositories/prisma-survey-feeback.repository';

@Module({
  controllers: [QuestionController],
  providers: [
    PrismaService,
    QuestionService,
    CloudinaryProvider,
    PrismaQuestionRepository,
    PrismaSurveyFeedbackRepository,
    PrismaMediaRepository,
    PrismaAnswerOptionRepository,
    QuestionConditionService,
    // PrismaQuestionConditionRepository
  ],
  exports: [QuestionService],
})
export class QuestionModule {}
