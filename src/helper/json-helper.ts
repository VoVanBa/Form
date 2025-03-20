import { FormSettingDto } from "src/survey-feedback-data/dtos/form.setting.dto";

export class JsonHelper {
  static parse<T>(jsonStr: string): T | null {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  }

  static mapGuestData(guestData: any) {
    if (!guestData || typeof guestData !== 'object') {
      return { name: '', address: '', phoneNumber: '' };
    }

    return {
      name: guestData.name || '',
      address: guestData.address || '',
      phoneNumber: guestData.phoneNumber || '',
    };
  }

  static getSettingValue<T>(
    configurations: any,
    key: string,
    defaultValue: T,
  ): T {
    if (Array.isArray(configurations)) {
      const settingItem = configurations.find(
        (config) =>
          config?.settings?.[key] !== undefined &&
          config?.settings?.[key] !== null,
      );

      console.log(settingItem ?? `Không tìm thấy ${key}`, `${key}Setting`);

      let value = settingItem?.settings?.[key];

      if (typeof defaultValue === 'number' && typeof value === 'string') {
        const parsedValue = Number(value);
        return isNaN(parsedValue) ? defaultValue : (parsedValue as T);
      }

      return value ?? defaultValue;
    }

    if (typeof configurations === 'object' && configurations?.settings) {
      let value = configurations.settings[key];

      if (typeof defaultValue === 'number' && typeof value === 'string') {
        const parsedValue = Number(value);
        return isNaN(parsedValue) ? defaultValue : (parsedValue as T);
      }

      return value ?? defaultValue;
    }

    console.warn(`Configurations không hợp lệ.`);
    return defaultValue;
  }

  static transformSettings(settings: any[]): FormSettingDto[] {
    return settings.map((setting) => {
      const { enabled, limit, date, position } = setting.value || {};
      return {
        key: setting.key,
        settings: { enabled, limit, date, position },
      };
    });
  }
}
