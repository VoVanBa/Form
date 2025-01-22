import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/config/prisma.service';

@Module({
  providers: [UsersService, PrismaService, JwtService],
  controllers: [UsersController],
})
export class UsersModule {}
