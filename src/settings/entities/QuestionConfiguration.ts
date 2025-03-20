export class QuestionConfiguration {
  id: number;
  key: string;
  settings: any;

  constructor(data: any) {
    this.id = data.id ?? 0;
    this.key = data.key ?? '';
    this.settings = data.settings ?? {};
  }
}
