import { forwardRef, Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { PrismaQuestionRepository } from 'src/repositories/prisma-question.repository';
import { PrismaService } from 'src/config/providers/prisma.service';
import { QuestionConditionService } from 'src/question-condition/question-condition.service';
import { MediaModule } from 'src/media/media.module';
import { AnswerOptionModule } from 'src/answer-option/answer-option.module';
import { SurveyFeedbackFormModule } from 'src/surveyfeedback-form/surveyfeedback-form.module';

@Module({
  controllers: [QuestionController],
  providers: [
    PrismaService,
    QuestionService,
    PrismaQuestionRepository,
    QuestionConditionService,
  ],
  exports: [QuestionService],
  imports: [MediaModule, AnswerOptionModule,forwardRef(() => SurveyFeedbackFormModule)],
})
export class QuestionModule {}
