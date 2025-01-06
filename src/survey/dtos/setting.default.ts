// surveySettingsDefaults.ts

export const surveySettingDefaults = [
  {
    name: 'Response Options',
    description: 'Các tùy chọn phản hồi',
    defaultValue: null,
    settings: [
      { key: 'closeOnResponseLimit', value: true },
      { key: 'responseLimit', value: 25 },
      { key: 'releaseOnDate', value: false },
      { key: 'closeOnDate', value: false },
    ],
  },
  {
    name: 'Recontact Options',
    description: 'Tùy chọn liên hệ lại',
    defaultValue: { allowRecontact: true },
    settings: [{ key: 'allowRecontact', value: true }],
  },
  {
    name: 'Survey Placement',
    description: 'Vị trí khảo sát',
    defaultValue: { position: 'top' },
    settings: [{ key: 'position', value: 'top' }],
  },
];
