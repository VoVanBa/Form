import { Module } from '@nestjs/common';
import { SurveyFeedbackFormController } from './surveyfeedback-form.controller';
import { SurveyFeedackFormService } from './surveyfeedback-form.service';
import { PrismasurveyFeedbackRepository } from 'src/repositories/prisma-survey-feeback.repository';
import { PrismaBusinessRepository } from 'src/repositories/prsima-business.repository';
import { PrismaFormSettingRepository } from 'src/repositories/prisma-setting.repository';
import { PrismaService } from 'src/config/prisma.service';
import { PrismaQuestionRepository } from 'src/repositories/prisma-question.repository';
import { PrismaAnswerOptionRepository } from 'src/repositories/prisma-anwser-option.repository';
import { PrismaMediaRepository } from 'src/repositories/prisma-media.repository';

@Module({
  controllers: [SurveyFeedbackFormController],
  providers: [
    SurveyFeedackFormService,
    PrismaService,
    PrismasurveyFeedbackRepository,
    PrismaBusinessRepository,
    PrismaFormSettingRepository,
    PrismaQuestionRepository,
    PrismaAnswerOptionRepository,
    PrismaMediaRepository,
  ],
})
export class SurveyFeedbackFormModule {}
