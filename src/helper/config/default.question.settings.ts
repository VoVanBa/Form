export const defaultQuestionSettings = [
  {
    key: 'SINGLE_CHOICE',
    settings: {
      require: true,
      other: false,
    },
  },
  {
    key: 'MULTI_CHOICE',
    settings: {
      maxSelections: null,
      require: true,
      other: false,
    },
  },
  {
    key: 'INPUT_TEXT',
    settings: {
      require: true,
      inputType: ['text', 'number', 'email', 'tel', 'url'],
      defaultValue: 'text',
    },
  },
  {
    key: 'RATING_SCALE',
    settings: {
      range: '5',
      lowerLabel: 'Poor',
      upperLabel: 'Excellent',
      ratingScale: 'stars',
      availableScales: ['stars', 'number', 'emoji'],
      availableRanges: ['3', '5', '7', '4', '10'],
      require: true,
    },
  },
  {
    key: 'PICTURE_SELECTION',
    settings: {
      require: true,
      maxSelections: null,
      minSelections: 1,
      other: false,
    },
  },
];
