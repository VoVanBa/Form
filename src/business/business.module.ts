import { Module } from '@nestjs/common';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { PrismaService } from 'src/config/prisma.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaBusinessRepository } from 'src/repositories/prims-business.repository';

@Module({
  controllers: [BusinessController],
  providers: [
    BusinessService,
    PrismaService,
    UsersService,
    JwtService,
    PrismaBusinessRepository,
  ],
})
export class BusinessModule {}
