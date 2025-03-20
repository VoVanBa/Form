import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaFormSettingRepository } from 'src/settings/repositories/prisma-setting.repository';
import { PrismaService } from 'src/helper/providers/prisma.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaFormSettingRepository, PrismaService],
})
export class AdminModule {}
