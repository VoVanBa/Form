import { Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { PrismaQuestionRepository } from 'src/repositories/prisma-question.repository';
import { PrismasurveyFeedbackRepository } from 'src/repositories/prisma-survey-feeback.repository';
import { PrismaMediaRepository } from 'src/repositories/prisma-media.repository';
import { PrismaAnswerOptionRepository } from 'src/repositories/prisma-anwser-option.repository';
import { PrismaService } from 'src/config/prisma.service';
import { CloudinaryProvider } from 'src/config/cloudinary.provider';
import { QuestionConditionService } from 'src/question-condition/question-condition.service';

@Module({
  controllers: [QuestionController],
  providers: [
    PrismaService,
    QuestionService,
    CloudinaryProvider,
    PrismaQuestionRepository,
    PrismasurveyFeedbackRepository,
    PrismaMediaRepository,
    PrismaAnswerOptionRepository,
    QuestionConditionService,
    // PrismaQuestionConditionRepository
  ],
})
export class QuestionModule {}
