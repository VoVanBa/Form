import { Module } from '@nestjs/common';
import { SurveyFeedbackFormController } from './surveyfeedback-form.controller';
import { SurveyFeedackFormService } from './surveyfeedback-form.service';
import { PrismasurveyFeedbackRepository } from 'src/repositories/prisma-survey-feeback.repository';
import { PrismaBusinessRepository } from 'src/repositories/prims-business.repository';
import { PrismaFormSettingRepository } from 'src/repositories/prisma-setting.repository';
import { PrismaService } from 'src/config/prisma.service';

@Module({
  controllers: [SurveyFeedbackFormController],
  providers: [
    SurveyFeedackFormService,
    PrismaService,
    PrismasurveyFeedbackRepository,
    PrismaBusinessRepository,
    PrismaFormSettingRepository,
  ],
})
export class SurveyFeedbackFormModule {}
