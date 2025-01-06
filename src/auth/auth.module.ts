import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import * as ms from 'ms';
import { PrismaService } from 'src/config/prisma.service';
import { JwtStrategy } from './passport/jwt.strategy';
import { LocalStrategy } from './passport/local.strategy';
import { UsersService } from 'src/users/users.service';
import { GoogleOauthGuard } from './google-oauth.guard';
import { GoogleStrategy } from './passport/google.strategy';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('SECRET');
        return {
          secret,
          signOptions: {
            expiresIn: ms(configService.get<string>('EXP_IN_REFRESH_TOKEN')),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    LocalStrategy,
    UsersService,
    GoogleStrategy,
  ],
})
export class AuthModule {}
