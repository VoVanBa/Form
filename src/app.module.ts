import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { MailModule } from './mail/mail.module';
import { BusinessModule } from './business/business.module';
import { QuestionModule } from './question/question.module';
import { FeedbackResponseModule } from './feedback-response/feedback-response.module';
import { SurveyFeedbackFormModule } from './surveyfeedback-form/surveyfeedback-form.module';
import { AdminModule } from './admin/admin.module';
import { ResponseSurveyModule } from './response-survey/response-survey.module';
import * as path from 'path';
import {
  I18nModule,
  I18nJsonLoader,
  QueryResolver,
  HeaderResolver,
  AcceptLanguageResolver,
} from 'nestjs-i18n'; // Import I18nJsonLoader
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    MailModule,
    BusinessModule,
    QuestionModule,
    FeedbackResponseModule,
    SurveyFeedbackFormModule,
    AdminModule,
    ResponseSurveyModule,

    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
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
