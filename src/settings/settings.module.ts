import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { QuestionConfigurationService } from './service/question-configuaration.service';
import { SurveyFeedbackSettingService } from './service/survey-feedback-setting.service';
import { PrismaSurveyFeedbackSettingRepository } from './repositories/prisma-survey-feedback-setting.repository';
import { PrismaQuestionConfigurationRepository } from './repositories/prisma-question-configuration.repository';
import { I18nService } from 'nestjs-i18n';
import { SurveyFeedbackDataModule } from 'src/survey-feedback-data/survey-feedback-data.module';
import { QuestionModule } from 'src/question/question.module';

@Module({
  providers: [
    PrismaService,
    QuestionConfigurationService,
    SurveyFeedbackSettingService,
    PrismaSurveyFeedbackSettingRepository,
    PrismaQuestionConfigurationRepository,
  ],
  exports: [QuestionConfigurationService, SurveyFeedbackSettingService],
  imports: [
    forwardRef(() => SurveyFeedbackDataModule),
    forwardRef(() => QuestionModule),
  ],
})
export class SettingsModule {}
