export class QuestionConfiguration {
  id: number;

  key: string;

  settings: any;

  constructor(data: Partial<QuestionConfiguration>) {
    Object.assign(this, data);
  }
}
