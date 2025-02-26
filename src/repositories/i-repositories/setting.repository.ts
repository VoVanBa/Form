import { UpdateSettingTypeDto } from 'src/admin/dtos/update.setting.type.dtos';
export interface IFormSettingRepository {
  findAllSettingTyped(tx?: any): Promise<any[]>;
  findById(id: number, tx?: any): Promise<any | null>;
  update(id: number, data: UpdateSettingTypeDto, tx?: any): Promise<any>;
  delete(id: number, tx?: any): Promise<void>;
  updateFormSetting(
    key: string,
    value: any,
    formSettingTypesId: number,
    tx?: any,
  ): Promise<any>;
  createFormSetting(
    key: string,
    value: any,
    formSettingTypesId: number,
    label: string,
    description: string,
    tx?: any,
  ): Promise<any>;
  getFormSettingByKey(key: string, tx?: any): Promise<any | null>;
  upsertSettingType(name: string, description: string, tx?: any): Promise<any>;
  upsertFormSetting(
    key: string,
    value: any,
    label: string,
    description: string,
    formSettingTypesId: number,
    tx?: any,
  ): Promise<any>;
  getAllFormSetting(tx?: any): Promise<any[]>;
  saveSetting(
    formId: number,
    businessId: number,
    key: string,
    value: any,
    formSettingId: number,
    tx?: any,
  ): Promise<any>;
  upsertSetting(
    formId: number,
    businessId: number | null,
    formSettingId: number,
    key: string,
    value: any,
    tx?: any,
  ): Promise<any>;
  getDefaultSetting(
    businessId: number,
    formId: number,
    tx?: any,
  ): Promise<any[]>;
  getAllBusinessSettingTypes(
    businessId: number,
    formId: number,
    tx?: any,
  ): Promise<any[]>;
  getAllFormSettingBusiness(
    businessId: number,
    formId: number,
    tx?: any,
  ): Promise<any[]>;
}
