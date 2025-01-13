import { UpdateSettingTypeDto } from 'src/admin/dtos/update.setting.type.dtos';

export interface IFormSettingRepository {
  findAllSettingTyped(): Promise<any[]>;
  findById(id: number): Promise<any | null>;
  update(id: number, data: UpdateSettingTypeDto): Promise<any>;
  delete(id: number): Promise<void>;
  upsertSettingType(name: string, description: string);
  upsertFormSetting(
    key: string,
    value: any,
    label: string,
    description: string,
    formSettingTypesId: number,
  );
}
