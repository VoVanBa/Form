export enum SurveySettingKey {
  CLOSE_ON_RESPONSE_LIMIT = 'CLOSE_ON_RESPONSE_LIMIT', // Đóng khảo sát khi đạt giới hạn phản hồi
  RELEASE_ON_DATE = 'RELEASE_ON_DATE', // Mở khảo sát vào ngày cụ thể
  CLOSE_ON_DATE = 'CLOSE_ON_DATE', // Đóng khảo sát vào ngày cụ thể
  SHOW_ONLY_ONCE = 'SHOW_ONLY_ONCE', // Chỉ hiển thị một lần
  SHOW_MULTIPLE_TIMES = 'SHOW_MULTIPLE_TIMES', // Hiển thị nhiều lần
  UNTIL_SUBMIT_RESPONSE = 'UNTIL_SUBMIT_RESPONSE', // Cho đến khi họ gửi phản hồi
  KEEP_SHOWING_WHILE_CONDITIONS_MATCH = 'KEEP_SHOWING_WHILE_CONDITIONS_MATCH', // Tiếp tục hiển thị nếu điều kiện vẫn phù hợp
  IGNORE_WAITING_TIME = 'IGNORE_WAITING_TIME', // Bỏ qua thời gian chờ giữa các khảo sát
  POSITION = 'POSITION', // Vị trí khảo sát
  EMAIL_NOTIFICATION = 'EMAIL_NOTIFICATION', // Thông báo qua email
}
