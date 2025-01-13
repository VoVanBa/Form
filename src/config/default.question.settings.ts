export const defaultQuestionSettings = [
  {
    key: 'SINGLE_CHOICE',
    settings: {
      require: true,
    },
  },
  {
    key: 'MULTI_CHOICE',
    settings: {
      maxSelections: 3,
      minSelections: 1,
      require: true,
    },
  },
  {
    key: 'INPUT_TEXT',
    settings: {
      require: true,
    },
  },
  {
    key: 'RATING_SCALE',
    settings: {
      isRequired: true,
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
    },
  },
];
