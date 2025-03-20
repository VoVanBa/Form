import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/helper/providers/prisma.service';

@Module({
  providers: [UsersService, PrismaService, JwtService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
