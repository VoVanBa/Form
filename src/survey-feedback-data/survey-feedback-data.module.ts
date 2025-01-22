import { Module } from '@nestjs/common';
import { SurveyFeedbackDataController } from './survey-feedback-data.controller';
import { PrismasurveyFeedbackRepository } from 'src/repositories/prisma-survey-feeback.repository';
import { PrismaUserResponseRepository } from 'src/repositories/prisma-user-response.repository';
import { PrismaResponseQuestionRepository } from 'src/repositories/prisma-response-question.repository';
import { PrismaQuestionRepository } from 'src/repositories/prisma-question.repository';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaFormSettingRepository } from 'src/repositories/prisma-setting.repository';
import { SurveyFeedbackDataService } from './survey-feedback-data.service';
import { PrismaService } from 'src/config/prisma.service';

@Module({
  controllers: [SurveyFeedbackDataController],
  providers: [
    PrismaService,
    PrismasurveyFeedbackRepository,
    PrismaUserResponseRepository,
    PrismaResponseQuestionRepository,
    PrismaQuestionRepository,
    UsersService,
    JwtService,
    PrismaFormSettingRepository,
    SurveyFeedbackDataService,
  ],
})
export class SurveyFeedbackDataModule {}
