import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { MailModule } from './mail/mail.module';
import { SurveyModule } from './survey/survey.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ResponseModule } from './response/response.module';
import { BusinessModule } from './business/business.module';
import { QuestionModule } from './question/question.module';
import { FeedbackResponseModule } from './feedback-response/feedback-response.module';
import { SurveyFeedbackFormModule } from './surveyfeedback-form/surveyfeedback-form.module';
import { AdminModule } from './admin/admin.module';
import { ResponseFeedbackService } from './response-feedback/response-feedback.service';
import { ResponseFeedbackController } from './response-feedback/response-feedback.controller';
import { ResponseFeedbackModule } from './response-feedback/response-feedback.module';
import { ResponseSurveyModule } from './response-survey/response-survey.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    MailModule,
    SurveyModule,
    FeedbackModule,
    ResponseModule,
    BusinessModule,
    QuestionModule,
    FeedbackResponseModule,
    SurveyFeedbackFormModule,
    AdminModule,
    ResponseFeedbackModule,
    ResponseSurveyModule,
  ],
  controllers: [AppController, ResponseFeedbackController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    ResponseFeedbackService,
  ],
})
export class AppModule {}
