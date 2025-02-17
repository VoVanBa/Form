export class QuestionConfiguration {
  id: number;

  key: string;

  settings: any;

  constructor(data: Partial<QuestionConfiguration>) {
    Object.assign(this, data);
  }

  static fromPrisma(data: any): QuestionConfiguration {
    if (!data) return null;
    return new QuestionConfiguration({
      id: data.id,
      key: data.key,
      settings: data.settings,
    });
  }
}
