import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from 'src/users/dtos/register.user.dto';
import { User } from '@prisma/client';
import { LoginUserDto } from 'src/users/dtos/login.user.dto';
import { Public } from '../common/decorater/customize';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { Response } from 'express';
import { GoogleOauthGuard } from '../common/guards/google-oauth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto): Promise<User> {
    console.log('register api');
    console.log(registerUserDto);
    return this.authService.register(registerUserDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() rq): Promise<any> {
    console.log('login api');
    return this.authService.loginUser(rq.user);
  }

  @Post('refresh-token')
  refreshToken(@Body() { refresh_token }): Promise<any> {
    console.log('refresh token api');
    return this.authService.refreshToken(refresh_token);
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    try {
      const auth = await this.authService.loginUser(req.user);
      const access_token = auth.access_token;

      res.cookie('access_token', access_token, {
        maxAge: 2592000000,
        sameSite: 'lax',
      });

      return res.json({
        access_token,
        user: req.user,
      });
    } catch (error) {
      console.error('Google OAuth Callback Error:', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('OAuth Callback Failed');
    }
  }
}
