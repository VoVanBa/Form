import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendMailDto } from './dtos/send.mail.dto';
import { Roles } from 'src/common/decorater/role.customize';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard)
  @Post('send-feedback-reply')
  async sendFeedbackReplyToMultiple(@Body() sendMailDto: SendMailDto) {
    const { email, customerNames, solution } = sendMailDto;
    return await this.mailService.sendFeedbackReplyToCustomer(
      email,
      customerNames,
      solution,
    );
  }
}
