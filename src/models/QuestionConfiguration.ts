export class QuestionConfiguration {
  id: number;

  key: string;

  settings: object;

  constructor(data: Partial<QuestionConfiguration>) {
    Object.assign(this, data);
  }
}
