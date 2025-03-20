import { forwardRef, Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './service/question.service';
import { PrismaQuestionRepository } from 'src/question/repositories/prisma-question.repository';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { MediaModule } from 'src/media/media.module';
import { AnswerOptionModule } from 'src/answer-option/answer-option.module';
import { SurveyFeedbackFormModule } from 'src/surveyfeedback-form/surveyfeedback-form.module';
import { QuestionConditionService } from './service/question-condition.service';
import { PrismaQuestionConditionRepository } from './repositories/prisma-questioncondition-repository';

@Module({
  controllers: [QuestionController],
  providers: [
    PrismaService,
    QuestionService,
    PrismaQuestionRepository,
    QuestionConditionService,
    PrismaQuestionConditionRepository,
  ],
  exports: [QuestionService, QuestionConditionService],
  imports: [
    forwardRef(() => MediaModule),
    AnswerOptionModule,
    forwardRef(() => SurveyFeedbackFormModule),
  ],
})
export class QuestionModule {}
