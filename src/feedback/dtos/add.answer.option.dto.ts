export class AddAnswerOptionDto {
  label: string;
  value?: number;
  isActive: boolean;
  sortOrder?: number;
  isCorrect?: boolean;
  description?: string;
  imageIds?: number[];
}
