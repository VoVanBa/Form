import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from 'src/config/prisma.service';
import { PrismaFormSettingRepository } from 'src/repositories/prisma-setting.repository';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaFormSettingRepository, PrismaService],
})
export class AdminModule {}
