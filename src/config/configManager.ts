import { validateSync } from 'class-validator';
import Setting from './setting';
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

  get(key: string): any {
    return this.config[key];
  }

  set(key: string, value: any): void {
    const setting = new Setting(
      value.enabled,
      value.limit,
      value.date,
      value.position,
    );

    const errors = validateSync(setting);
    if (errors.length > 0) {
      throw new Error(`Invalid configuration for key ${key}: ${errors}`);
    }

    this.config[key] = setting;
  }

  has(key: string): boolean {
    return this.config.hasOwnProperty(key);
  }

  delete(key: string): void {
    delete this.config[key];
  }

  toJSON(): string {
    return JSON.stringify(this.config);
  }

  fromJSON(jsonString: string): void {
    const config = JSON.parse(jsonString);
    this.config = this.validateConfig(config);
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
    // Nếu `configurations` là một mảng
    if (Array.isArray(configurations)) {
      const settingItem = configurations.find(
        (config) =>
          config?.settings?.[key] !== undefined &&
          config?.settings?.[key] !== null,
      );

      console.log(settingItem ?? `Không tìm thấy ${key}`, `${key}Setting`);

      let value = settingItem?.settings?.[key];

      // Nếu `defaultValue` là số, cố gắng chuyển đổi giá trị thành số
      if (typeof defaultValue === 'number' && typeof value === 'string') {
        const parsedValue = Number(value);
        return isNaN(parsedValue) ? defaultValue : (parsedValue as T);
      }

      return value ?? defaultValue;
    }

    // Nếu `configurations` là một object chứa settings trực tiếp
    if (typeof configurations === 'object' && configurations?.settings) {
      let value = configurations.settings[key];

      // Nếu `defaultValue` là số, cố gắng chuyển đổi giá trị thành số
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
