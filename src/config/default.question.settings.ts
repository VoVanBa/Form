import { PrismaClient } from '@prisma/client';

export const defaultQuestionSettings = [
  {
    key: 'SINGLE_CHOICE',
    settings: {
      allowOther: false,
      randomizeOptions: false,
      maxSelections: 1,
      require: true,
    },
  },
  {
    key: 'MULTI_CHOICE',
    settings: {
      maxSelections: 3 ,
      minSelections: 1,
      require: true,
    },
  },
  {
    key: 'INPUT_TEXT',
    settings: {
      maxLength: 500,
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
      maxSelections: 1,
      require: true,
    },
  },
];
