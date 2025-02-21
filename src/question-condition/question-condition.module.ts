import { Module } from '@nestjs/common';
import { QuestionConditionController } from './question-condition.controller';
import { QuestionConditionService } from './question-condition.service';
import { PrismaQuestionConditionRepository } from 'src/repositories/prisma-questioncondition-repository';
import { PrismaService } from 'src/config/prisma.service';

@Module({
  controllers: [QuestionConditionController],
  providers: [
    QuestionConditionService,
    PrismaQuestionConditionRepository,
    PrismaService,
  ],
})
export class QuestionConditionModule {}
