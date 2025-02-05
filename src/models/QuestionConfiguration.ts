import { Expose } from 'class-transformer';

export class QuestionConfiguration {
  @Expose()
  id: number;
  @Expose()
  key: string;
  @Expose()
  settings: object;

  constructor(id: number, key: string, settings: object) {
    this.id = id;
    this.key = key;
    this.settings = settings;
  }
}
