export class QuestionConfiguration {
  id: number;
  questionId: number;
  formId: number;
  key: string;
  settings: any;

  constructor(data: any) {
    this.id = data.id ?? 0;
    this.questionId = data.questionId ?? 0;
    this.formId = data.formId ?? 0;
    this.key = data.key ?? '';
    this.settings = data.settings ?? {};
  }
}
