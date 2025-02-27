import { Module } from '@nestjs/common';
import { QuestionConditionController } from './question-condition.controller';
import { PrismaService } from 'src/config/providers/prisma.service';
import { QuestionConditionService } from './question-condition.service';

@Module({
  controllers: [QuestionConditionController],
  providers: [
    QuestionConditionService,
    // PrismaQuestionConditionRepository,
    PrismaService,
  ],
})
export class QuestionConditionModule {}
