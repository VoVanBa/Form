import { Module } from '@nestjs/common';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaBusinessRepository } from 'src/repositories/prsima-business.repository';
import { PrismaService } from 'src/config/providers/prisma.service';

@Module({
  controllers: [BusinessController],
  providers: [
    BusinessService,
    PrismaService,
    UsersService,
    JwtService,
    PrismaBusinessRepository,
  ],
  exports: [BusinessService],
})
export class BusinessModule {}
