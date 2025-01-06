import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendFeedbackReplyToMultipleCustomers(
    emails: string[],
    customerNames: string[],
  ) {
    const subject = 'Thank you for your feedback!';

    const emailPromises = emails.map((email, index) => {
      const customerName = customerNames[index];

      const text = `Dear ${customerName},\n\nThank you for your feedback. We are reviewing your request and will get back to you shortly.`;

      const html = `
        <p>Dear ${customerName},</p>
        <p>Thank you for your valuable feedback! We appreciate you taking the time to share your thoughts with us. Our team is currently reviewing your feedback and we will get back to you as soon as possible.</p>
        <p>In the meantime, if you have any further questions or suggestions, feel free to reach out to us.</p>
        <p>Best regards,</p>
        <p><strong>Your Company Name</strong></p>
        <p><i>Customer Support Team</i></p>
        <hr>
        <p><small>If you did not submit this feedback or believe you have received this message in error, please contact us at <a href="mailto:support@yourcompany.com">support@yourcompany.com</a></small></p>
      `;

      const mailOptions = {
        to: email,
        subject,
        text,
        html,
      };

      return this.mailerService.sendMail(mailOptions);
    });

    try {
      const results = await Promise.all(emailPromises);
      console.log(
        'Feedback replies sent successfully:',
        results.map((result) => result.messageId),
      );
      return { message: 'Feedback replies sent successfully', results };
    } catch (error) {
      console.error('Error sending feedback replies:', error);
      return {
        message: 'Error sending feedback replies',
        error: error.message,
      };
    }
  }

  async sendAtutoFeedbackReplyToCustomer(email: string, customerName: string) {
    const subject = 'Cảm ơn bạn đã phản hồi!';

    const text = `Kính gửi ${customerName},\n\nCảm ơn bạn đã dành thời gian gửi phản hồi đến chúng tôi. Chúng tôi đang xem xét yêu cầu của bạn và sẽ phản hồi lại sớm nhất có thể.`;

    const html = `
      <p>Kính gửi ${customerName},</p>
      <p>Cảm ơn bạn đã gửi phản hồi quý giá! Chúng tôi rất trân trọng ý kiến của bạn. Đội ngũ của chúng tôi hiện đang xem xét phản hồi của bạn và sẽ liên hệ lại với bạn trong thời gian sớm nhất.</p>
      <p>Trong thời gian chờ đợi, nếu bạn có bất kỳ câu hỏi hoặc đề xuất nào khác, đừng ngần ngại liên hệ với chúng tôi.</p>
      <p>Trân trọng,</p>
      <p><strong>Đội hỗ trợ khách hàng của công ty chúng tôi</strong></p>
      <hr>
      <p><small>Nếu bạn không gửi phản hồi này hoặc nếu bạn tin rằng bạn đã nhận được tin nhắn này do nhầm lẫn, vui lòng liên hệ với chúng tôi qua email: <a href="mailto:support@yourcompany.com">support@yourcompany.com</a></small></p>
    `;

    const mailOptions = {
      to: email,
      subject,
      text,
      html,
    };

    try {
      const result = await this.mailerService.sendMail(mailOptions);
      console.log('Đã gửi phản hồi thành công:', result.messageId);

      return { message: 'Phản hồi gửi thành công', result };
    } catch (error) {
      console.error('Lỗi khi gửi phản hồi:', error);
      return {
        message: 'Lỗi khi gửi phản hồi',
        error: error.message,
      };
    }
  }

  async sendFeedbackReplyToCustomer(
    email: string,
    customerName: string,
    solution: string,
  ) {
    const subject = 'Phản hồi của bạn đã được giải quyết!';

    const text = `
      Kính gửi ${customerName},

      Cảm ơn bạn đã gửi phản hồi quý giá đến chúng tôi. Chúng tôi rất trân trọng ý kiến của bạn và đã xem xét vấn đề bạn nêu ra.
      
      Giải pháp chúng tôi đã thực hiện: ${solution}

      Nếu bạn có bất kỳ câu hỏi nào thêm, vui lòng liên hệ lại với chúng tôi.

      Trân trọng,
      Đội ngũ hỗ trợ khách hàng
    `;

    const html = `
      <p>Kính gửi ${customerName},</p>
      <p>Cảm ơn bạn đã gửi phản hồi quý giá đến chúng tôi. Chúng tôi rất trân trọng ý kiến của bạn và đã xem xét vấn đề bạn nêu ra.</p>
      
      <p><strong>Giải pháp chúng tôi đã thực hiện:</strong> ${solution}</p>
      
      <p>Nếu bạn có bất kỳ câu hỏi nào thêm, vui lòng liên hệ lại với chúng tôi.</p>
      
      <p>Trân trọng,<br/>Đội ngũ hỗ trợ khách hàng</p>
    `;

    const mailOptions = {
      to: email,
      subject,
      text,
      html,
    };

    try {
      const result = await this.mailerService.sendMail(mailOptions);
      console.log('Đã gửi phản hồi thành công:', result.messageId);
      return { message: 'Phản hồi gửi thành công', result };
    } catch (error) {
      console.error('Lỗi khi gửi phản hồi:', error);
      return {
        message: 'Lỗi khi gửi phản hồi',
        error: error.message,
      };
    }
  }
}
