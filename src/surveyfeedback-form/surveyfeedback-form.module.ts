import { Module } from '@nestjs/common';
import { SurveyFeedbackFormController } from './surveyfeedback-form.controller';
import { SurveyFeedackFormService } from './surveyfeedback-form.service';
import { PrismaService } from 'src/config/prisma.service';
import { PrismasurveyFeedbackRepository } from 'src/repositories/prisma-form.repository';
import { PrismaBusinessRepository } from 'src/repositories/prims-business.repository';

@Module({
  controllers: [SurveyFeedbackFormController],
  providers: [
    SurveyFeedackFormService,
    PrismaService,
    PrismasurveyFeedbackRepository,
    PrismaBusinessRepository
  ],
})
export class SurveyFeedbackFormModule {}
