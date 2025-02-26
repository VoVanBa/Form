import { Module } from '@nestjs/common';
import { SurveyFeedbackFormController } from './surveyfeedback-form.controller';
import { SurveyFeedackFormService } from './surveyfeedback-form.service';
import { PrismaFormSettingRepository } from 'src/repositories/prisma-setting.repository';
import { PrismaService } from 'src/config/prisma.service';
import { PrismaQuestionRepository } from 'src/repositories/prisma-question.repository';
import { PrismaAnswerOptionRepository } from 'src/repositories/prisma-anwser-option.repository';
import { PrismaMediaRepository } from 'src/repositories/prisma-media.repository';
import { PrismaSurveyEndingRepository } from 'src/repositories/prisma-survey-feedback-ending-repository';
import { BusinessService } from 'src/business/business.service';
import { PrismaBusinessRepository } from 'src/repositories/prsima-business.repository';
import { QuestionModule } from 'src/question/question.module';
import { PrismaSurveyFeedbackRepository } from 'src/repositories/prisma-survey-feeback.repository';

@Module({
  imports: [QuestionModule],
  controllers: [SurveyFeedbackFormController],
  providers: [
    SurveyFeedackFormService,
    PrismaService,
    PrismaSurveyFeedbackRepository,
    PrismaFormSettingRepository,
    PrismaQuestionRepository,
    PrismaAnswerOptionRepository,
    PrismaMediaRepository,
    PrismaSurveyEndingRepository,
    BusinessService,
    PrismaBusinessRepository,
  ],
})
export class SurveyFeedbackFormModule {}
