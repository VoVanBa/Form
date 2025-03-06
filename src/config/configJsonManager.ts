import { validateSync } from 'class-validator';
import Setting from './settings/setting.dto';
import { FormSettingDto } from 'src/survey-feedback-data/dtos/form.setting.dto';

interface Config {
  [key: string]: any;
}

class ConfigManager {
  private config: Config;

  constructor(config: Config) {
    this.config = this.validateConfig(config);
  }

  private validateConfig(config: Config): Config {
    for (const key in config) {
      if (config.hasOwnProperty(key)) {
        const setting = new Setting(
          config[key].enabled,
          config[key].limit,
          config[key].date,
          config[key].position,
        );

        const errors = validateSync(setting);
        if (errors.length > 0) {
          throw new Error(`Invalid configuration for key ${key}: ${errors}`);
        }
      }
    }
    return config;
  }

  transformSettings(settings: any[]): FormSettingDto[] {
    return settings.map((setting) => {
      const { enabled, limit, date, position } = setting.value || {};
      return {
        key: setting.key,
        settings: { enabled, limit, date, position },
      };
    });
  }

  mapGuestDataToJson(guestData: any) {
    if (!guestData || typeof guestData !== 'object') {
      return { name: '', address: '', phoneNumber: '' };
    }

    return {
      name: guestData.name || '',
      address: guestData.address || '',
      phoneNumber: guestData.phoneNumber || '',
    };
  }

  getSettingValue<T>(configurations: any, key: string, defaultValue: T): T {
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
}

export default ConfigManager;
