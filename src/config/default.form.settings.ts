import { name } from 'ejs';
export const defaultFormSettings = [
  {
    name: 'Tùy Chọn Phản Hồi',
    description: 'Các tùy chọn liên quan đến phản hồi khảo sát',
    settings: [
      {
        key: 'closeOnResponseLimit',
        label: 'Đóng khảo sát khi đạt giới hạn phản hồi',
        description:
          'Tự động đóng khảo sát sau khi đạt đến một số lượng phản hồi nhất định.',
        value: {
          enabled: false, // Giá trị bật/tắt
          limit: 25, // Số lượng phản hồi giới hạn
        },
      },
      {
        key: 'releaseOnDate',
        label: 'Mở khảo sát vào ngày cụ thể',
        description: 'Tự động mở khảo sát vào đầu ngày (theo giờ UTC).',
        value: {
          enabled: true, // Giá trị bật/tắt
          date: null, // Ngày được chọn
        },
      },
      {
        key: 'closeOnDate',
        label: 'Đóng khảo sát vào ngày cụ thể',
        description: 'Tự động đóng khảo sát vào đầu ngày (theo giờ UTC).',
        value: {
          enabled: false, // Giá trị bật/tắt
          date: null, // Ngày được chọn
        },
      },
    ],
  },
  {
    name: 'Tùy Chọn Liên Hệ Lại',
    description: 'Các tùy chọn hiển thị lại khảo sát',
    settings: [
      {
        key: 'showOnlyOnce',
        label: 'Chỉ hiển thị một lần',
        description:
          'Khảo sát sẽ chỉ hiển thị một lần, ngay cả khi người dùng không phản hồi.',
        value: {
          enabled: false, // Giá trị bật/tắt
        },
      },
      {
        key: 'showMultipleTimes',
        label: 'Hiển thị nhiều lần',
        description:
          'Khảo sát sẽ được hiển thị nhiều lần cho đến khi người dùng phản hồi.',
        value: {
          enabled: false,
        },
      },
      {
        key: 'untilSubmitResponse',
        label: 'Cho đến khi họ gửi phản hồi',
        description:
          'Nếu bạn thực sự cần phản hồi, hãy tiếp tục hỏi cho đến khi nhận được.',
        value: {
          enabled: true, // Giá trị bật/tắt
        },
      },
      {
        key: 'keepShowingWhileConditionsMatch',
        label: 'Tiếp tục hiển thị nếu điều kiện vẫn phù hợp',
        description: 'Ngay cả khi họ đã gửi phản hồi (ví dụ: Hộp Phản Hồi).',
        value: {
          enabled: false,
        },
      },
      {
        key: 'ignoreWaitingTime',
        label: 'Bỏ qua thời gian chờ giữa các khảo sát',
        description:
          'Cài đặt này sẽ ghi đè khoảng thời gian chờ của bạn. Hãy sử dụng cẩn thận.',
        value: {
          enabled: false,
        },
      },
    ],
  },
  {
    name: 'Vị Trí Hiển Thị Khảo Sát',
    description: 'Cài đặt vị trí khảo sát trên màn hình',
    settings: [
      {
        key: 'position',
        label: 'Vị trí khảo sát',
        description: 'Chọn vị trí khảo sát sẽ xuất hiện trên màn hình.',
        value: {
          position: 'top', // Vị trí hiển thị
        },
      },
    ],
  },

  {
    name: 'Tùy Chọn Thông Báo',
    description: 'Các tùy chọn liên quan đến thông báo',
    settings: [
      {
        key: 'email_notification',
        label: 'Thông Báo Qua Email',
        description: 'Cấu hình thông báo qua email cho phản hồi khảo sát',
        value: {
          enabled: false,
          recipients: ['manager@company.com'], // Danh sách email nhận thông báo
        },
      },
    ],
  },

  {
    name: 'Hoàn Thành',
    description: 'Cài đặt hoàn thành khảo sát',
    settings: [
      {
        key: 'redirectUrl',
        label: 'Chuyển hướng URL',
        description:
          'Chuyển hướng người dùng đến URL cụ thể sau khi hoàn thành khảo sát.',
        value: {
          enabled: false,
          url: null,
        },
      },
      {
        key: 'showThankYouMessage',
        label: 'Hiển thị thông báo cảm ơn',
        description:
          'Hiển thị thông báo cảm ơn người dùng sau khi hoàn thành khảo sát.',
        value: {
          enabled: true,
          message: 'Cảm ơn bạn đã hoàn thành khảo sát!',
        },
      },
    ],
  },
];
