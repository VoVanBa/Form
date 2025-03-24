import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { UpdateSettingTypeDto } from './dtos/update.setting.type.dtos';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private service: AdminService) {}

  // @Get()
  // findAll() {
  //   return this.service.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: number) {
  //   return this.service.findById(id);
  // }

  // @Put(':id')
  // update(
  //   @Param('id') id: number,
  //   @Body() updateSettingTypeDto: UpdateSettingTypeDto,
  // ) {
  //   return this.service.update(id, updateSettingTypeDto);
  // }

  // @Delete(':id')
  // delete(@Param('id') id: number) {
  //   return this.service.delete(id);
  // }

  // @Post('save-default/setting')
  // async saveSettings() {
  //   return await this.service.saveFormSetting();
  // }
}
