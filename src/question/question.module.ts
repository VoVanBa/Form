import { forwardRef, Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './service/question.service';
import { PrismaQuestionRepository } from 'src/question/repositories/prisma-question.repository';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { MediaModule } from 'src/media/media.module';
import { AnswerOptionModule } from 'src/answer-option/answer-option.module';
import { SurveyFeedbackFormModule } from 'src/surveyfeedback-form/surveyfeedback-form.module';
import { SettingsModule } from 'src/settings/settings.module';
import { QuestionLogicService } from './service/question-condition.service';
import { PrismaQuestionLogicRepository } from './repositories/prisma-questioncondition-repository';

@Module({
  controllers: [QuestionController],
  providers: [
    PrismaService,
    QuestionService,
    PrismaQuestionRepository,
    QuestionLogicService,
    PrismaQuestionLogicRepository
  ],
  exports: [QuestionLogicService, QuestionService],
  imports: [
    forwardRef(() => MediaModule),
    AnswerOptionModule,
    forwardRef(() => SurveyFeedbackFormModule),
    forwardRef(() => SettingsModule),
  ],
})
export class QuestionModule {}
