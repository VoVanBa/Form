import { forwardRef, Module } from '@nestjs/common';
import { QuestionConditionController } from './question-condition.controller';
import { PrismaService } from 'src/config/providers/prisma.service';
import { PrismaQuestionConditionRepository } from 'src/repositories/prisma-questioncondition-repository';
import { QuestionConditionService } from './question-condition.service';
import { QuestionModule } from 'src/question/question.module';
import { PrismaQuestionRepository } from 'src/repositories/prisma-question.repository';

@Module({
  controllers: [QuestionConditionController],
  providers: [
    QuestionConditionService,
    PrismaQuestionConditionRepository,
    PrismaService,
    PrismaQuestionRepository
  ],
  exports: [QuestionConditionService],
  imports: [forwardRef(() => QuestionModule)],
})
export class QuestionConditionModule {}
