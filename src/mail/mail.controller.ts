import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendMailDto } from './dtos/send.mail.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorater/role.customize';

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
