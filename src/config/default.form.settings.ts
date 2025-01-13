export const defaultFormSettings = [
  {
    name: 'Response Options',
    description: 'Các tùy chọn phản hồi',
    settings: [
      {
        key: 'closeOnResponseLimit',
        label: 'Close survey on response limit',
        description:
          'Automatically close the survey after a certain number of responses.',
        value: {
          enabled: false, // Giá trị bật/tắt
          limit: 25, // Số lượng phản hồi giới hạn
        },
      },
      {
        key: 'releaseOnDate',
        label: 'Release survey on date',
        description:
          'Automatically release the survey at the beginning of the day (UTC).',
        value: {
          enabled: true, // Giá trị bật/tắt
          date: null, // Ngày được chọn
        },
      },
      {
        key: 'closeOnDate',
        label: 'Close survey on date',
        description:
          'Automatically closes the survey at the beginning of the day (UTC).',
        value: {
          enabled: false, // Giá trị bật/tắt
          date: null, // Ngày được chọn
        },
      },
    ],
  },
  {
    name: 'Recontact Options',
    description: 'Tùy chọn liên hệ lại',
    settings: [
      {
        key: 'showOnlyOnce',
        label: 'Show only once',
        description:
          "The survey will be shown once, even if person doesn't respond.",
        value: {
          enabled: false, // Giá trị bật/tắt
        },
      },
      {
        key: 'showMultipleTimes',
        label: 'Show multiple times',
        description:
          'The survey will be shown multiple times until they respond.',
        value: {
          enabled: false,
        },
      },
      {
        key: 'untilSubmitResponse',
        label: 'Until they submit a response',
        description: 'If you really want that answer, ask until you get it.',
        value: {
          enabled: true, // Giá trị bật/tắt
        },
      },
      {
        key: 'keepShowingWhileConditionsMatch',
        label: 'Keep showing while conditions match',
        description:
          'Even after they submitted a response (e.g., Feedback Box).',
        value: {
          enabled: false,
        },
      },
      {
        key: 'ignoreWaitingTime',
        label: 'Ignore waiting time between surveys',
        description:
          'This setting overwrites your waiting period. Use with caution.',
        value: {
          enabled: false,
        },
      },
    ],
  },
  {
    name: 'Survey Placement',
    description: 'Vị trí khảo sát',
    settings: [
      {
        key: 'position',
        label: 'Survey position',
        description: 'Set where the survey appears on the screen.',
        value: {
          position: 'top', // Vị trí hiển thị
        },
      },
    ],
  },
];
