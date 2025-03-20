import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { PrismaFormSettingRepository } from './repositories/prisma-setting.repository';
import { PrismaService } from 'src/helper/providers/prisma.service';

@Module({
  providers: [SettingsService, PrismaFormSettingRepository, PrismaService],
  exports: [SettingsService],
})
export class SettingsModule {}
