export class QuestionConfiguration {
  id: number;
  key: string;
  settings: object;

  constructor(id: number, key: string, settings: object) {
    this.id = id;
    this.key = key;
    this.settings = settings;
  }
}
