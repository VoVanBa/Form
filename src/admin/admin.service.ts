import { Injectable } from '@nestjs/common';
import { UpdateSettingTypeDto } from './dtos/update.setting.type.dtos';
import { defaultFormSettings } from 'src/helper/config/default.form.settings';

@Injectable()
export class AdminService {
  constructor() {}

  // findById(id: number) {
  //   return this.repository.findById(id);
  // }

  // update(id: number, data: UpdateSettingTypeDto) {
  //   return this.repository.update(id, data);
  // }

  // delete(id: number) {
  //   return this.repository.delete(id);
  // }
  // async saveFormSetting() {
  //   for (const formSettingType of defaultFormSettings) {
  //     const settingType = await this.repository.upsertSettingType(
  //       formSettingType.name,
  //       formSettingType.description,
  //     );

  //     for (const setting of formSettingType.settings) {
  //       await this.repository.upsertFormSetting(
  //         setting.key,
  //         setting.value,
  //         setting.label,
  //         setting.description,
  //         settingType.id,
  //       );
  //     }
  //   }
  // }
}
