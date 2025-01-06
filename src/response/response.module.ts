import { Module } from '@nestjs/common';
import { ResponseController } from './response.controller';
import { ResponseService } from './response.service';
import { PrismaService } from 'src/config/prisma.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ResponseController],
  providers: [ResponseService, PrismaService, UsersService, JwtService],
})
export class ResponseModule {}
