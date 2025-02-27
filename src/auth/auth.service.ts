import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from 'src/users/dtos/login.user.dto';
import { RegisterUserDto } from 'src/users/dtos/register.user.dto';
import * as ms from 'ms';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/config/providers/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prismaService: PrismaService,
    private userService: UsersService,
  ) {}
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOneUserByEmail(email);
    if (user) {
      const isValid = bcrypt.compareSync(password, user.password);
      if (isValid) {
        return user;
      }
    }
    return null;
  }
  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const hashPassword = await this.hashPassword(registerUserDto.password);

    return await this.prismaService.user.create({
      data: {
        ...registerUserDto,
        refreshToken: '',
        password: hashPassword,
        role: Role.CUSTOMER,
      },
    });
  }

  async loginUser(user: any) {
    let userExisting = await this.prismaService.user.findUnique({
      where: { email: user.email },
    });

    if (!userExisting) {
      if (user.providerId) {
        userExisting = await this.prismaService.user.create({
          data: {
            email: user.email,
            username: user.name,
            googleId: user.providerId,
            role: Role.CUSTOMER,
            password: '',
            refreshToken: '',
          },
        });
      } else {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
      }
    }

    return this.generateToken({
      id: userExisting.id,
      email: userExisting.email,
      role: userExisting.role,
    });
  }

  async refreshToken(refresh_token: string): Promise<any> {
    try {
      const verify = await this.jwtService.verifyAsync(refresh_token, {
        secret: this.configService.get<string>('SECRET'),
      });
      const checkExistToken = await this.prismaService.user.findFirst({
        where: {
          email: verify.email,
          refreshToken: refresh_token,
        },
      });

      if (checkExistToken) {
        return this.generateToken({
          id: verify.id,
          email: verify.email,
          role: verify.role,
        });
      } else {
        throw new HttpException(
          'Refresh token is not valid',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(
        'Refresh token is not valid',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async generateToken(payload: {
    id: number;
    email: string;
    role: string;
  }) {
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('SECRET'),
      expiresIn: ms(this.configService.get<string>('EXP_IN_REFRESH_TOKEN')),
    });
    await this.prismaService.user.update({
      where: {
        email: payload.email,
      },
      data: {
        refreshToken: refresh_token,
      },
    });

    return { access_token, refresh_token };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }
}
