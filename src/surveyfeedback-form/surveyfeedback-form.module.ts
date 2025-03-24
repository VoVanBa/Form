import { forwardRef, Module } from '@nestjs/common';
import { SurveyFeedbackFormController } from './surveyfeedback-form.controller';
import { SurveyFeedackFormService } from './surveyfeedback-form.service';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { PrismaAnswerOptionRepository } from 'src/answer-option/repositories/prisma-anwser-option.repository';
import { PrismaSurveyEndingRepository } from 'src/surveyfeedback-form/repositories/prisma-survey-feedback-ending-repository';
import { QuestionModule } from 'src/question/question.module';
import { MediaModule } from 'src/media/media.module';
import { AnswerOptionModule } from 'src/answer-option/answer-option.module';
import { BusinessModule } from 'src/business/business.module';
import { PrismaUserResponseRepository } from 'src/repositories/prisma-user-response.repository';
import { SurveyFeedbackDataModule } from 'src/survey-feedback-data/survey-feedback-data.module';
import { UsersModule } from 'src/users/users.module';
import { SettingsModule } from 'src/settings/settings.module';
import { PrismaSurveyFeedbackRepository } from './repositories/prisma-survey-feeback.repository';

@Module({
  imports: [
    forwardRef(() => QuestionModule),
    MediaModule,
    AnswerOptionModule,
    BusinessModule,
    SurveyFeedbackDataModule,
    UsersModule,
    SettingsModule,
  ],
  controllers: [SurveyFeedbackFormController],
  providers: [
    SurveyFeedackFormService,
    PrismaService,
    PrismaSurveyEndingRepository,
    PrismaSurveyFeedbackRepository,
  ],
  exports: [SurveyFeedackFormService],
})
export class SurveyFeedbackFormModule {}
