import { Module } from '@nestjs/common';
import { SurveyFeedbackDataController } from './survey-feedback-data.controller';
import { PrismaUserResponseRepository } from 'src/repositories/prisma-user-response.repository';
import { PrismaResponseQuestionRepository } from 'src/repositories/prisma-response-question.repository';
import { PrismaQuestionRepository } from 'src/repositories/prisma-question.repository';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaFormSettingRepository } from 'src/repositories/prisma-setting.repository';
import { SurveyFeedbackDataService } from './survey-feedback-data.service';
import { PrismaService } from 'src/config/providers/prisma.service';
import ConfigManager from 'src/config/configJsonManager';
import { PrismaSurveyFeedbackRepository } from 'src/repositories/prisma-survey-feeback.repository';

@Module({
  controllers: [SurveyFeedbackDataController],
  providers: [
    PrismaService,
    PrismaSurveyFeedbackRepository,
    PrismaUserResponseRepository,
    PrismaResponseQuestionRepository,
    PrismaQuestionRepository,
    UsersService,
    JwtService,
    PrismaFormSettingRepository,
    SurveyFeedbackDataService,
    ConfigManager,
  ],
  exports: [SurveyFeedbackDataService],
})
export class SurveyFeedbackDataModule {}
