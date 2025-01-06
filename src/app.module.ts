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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
