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
      const { enabled, limit, date, position } = setting.value || {}; // Giữ an toàn nếu value không tồn tại
      return {
        key: setting.key,
        settings: { enabled, limit, date, position },
      };
    });
  }

  static mapGuestDataToJson(guestData: any) {
    if (!guestData || typeof guestData !== 'object') {
      return { name: '', address: '', phoneNumber: '' };
    }

    return {
      name: guestData.name || '',
      address: guestData.address || '',
      phoneNumber: guestData.phoneNumber || '',
    };
  }
}

export default ConfigManager;
