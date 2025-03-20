export class QuestionSetting {
  key: string;
  settings: {
    required?: boolean;
    other?: boolean;
    maxSelections?: number;
    minSelections?: number;
    isRequired?: boolean;
    range?: string;
    lowerLabel?: string;
    upperLabel?: string;
    ratingScale?: string;
    availableScales?: string[];
    availableRanges?: string[];
  };
}
