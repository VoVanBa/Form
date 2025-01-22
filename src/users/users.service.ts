import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { name } from 'ejs';
import { PrismaService } from 'src/config/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async findOneUserByEmail(email: string): Promise<User> {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async getUserById(userId: number) {
    return this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        businesses: true,
      },
    });
  }
  async getUserByJwt(jwt: string) {
    if (!jwt) {
      throw new UnauthorizedException('Token is required');
    }
    let token = '';
    if (jwt.startsWith('Bearer ')) {
      token = jwt.substring(7);
    } else {
      token = jwt;
    }
    if (!token) {
      throw new UnauthorizedException('Token is invalid');
    }
    const secret = this.configService.get<string>('SECRET');

    const payload = this.jwtService.verify(token, { secret });
    console.log(payload);
    const user = this.prismaService.user.findUnique({
      where: {
        email: payload.email,
      },
    });
    return user;
  }
}
