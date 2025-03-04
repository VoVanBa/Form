import { forwardRef, Module } from '@nestjs/common';
import { SurveyFeedbackFormController } from './surveyfeedback-form.controller';
import { SurveyFeedackFormService } from './surveyfeedback-form.service';
import { PrismaFormSettingRepository } from 'src/repositories/prisma-setting.repository';
import { PrismaService } from 'src/config/providers/prisma.service';
import { PrismaAnswerOptionRepository } from 'src/repositories/prisma-anwser-option.repository';
import { PrismaSurveyEndingRepository } from 'src/repositories/prisma-survey-feedback-ending-repository';
import { BusinessService } from 'src/business/business.service';
import { QuestionModule } from 'src/question/question.module';
import { PrismaSurveyFeedbackRepository } from 'src/repositories/prisma-survey-feeback.repository';
import { MediaModule } from 'src/media/media.module';
import { AnswerOptionModule } from 'src/answer-option/answer-option.module';
import { BusinessModule } from 'src/business/business.module';
import { PrismaUserResponseRepository } from 'src/repositories/prisma-user-response.repository';
import { SurveyFeedbackDataModule } from 'src/survey-feedback-data/survey-feedback-data.module';
import { UsersModule } from 'src/users/users.module';
import { QuestionConditionModule } from 'src/question-condition/question-condition.module';

@Module({
  imports: [
    forwardRef(() => QuestionModule),
    MediaModule,
    AnswerOptionModule,
    BusinessModule,
    SurveyFeedbackDataModule,
    UsersModule,
    QuestionConditionModule
  ],
  controllers: [SurveyFeedbackFormController],
  providers: [
    SurveyFeedackFormService,
    PrismaService,
    PrismaSurveyFeedbackRepository,
    PrismaFormSettingRepository,
    PrismaAnswerOptionRepository,
    PrismaSurveyEndingRepository,
    PrismaUserResponseRepository,
  ],
  exports: [SurveyFeedackFormService],
})
export class SurveyFeedbackFormModule {}
