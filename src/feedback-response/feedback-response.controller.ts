import { Controller, Headers, UseGuards } from '@nestjs/common';
import { Body, Get, Param, Post, Put } from '@nestjs/common';
import { FeedbackResponseService } from './feedback-response.service';
import { UsersService } from 'src/users/users.service';

@Controller('feedback-response')
export class FeedbackResponseController {
  constructor(
    private readonly feedbackResponseService: FeedbackResponseService,
    private userService: UsersService,
  ) {}

  // @Post()
  // @UseGuards(JwtAuthGuard)
  // async createFeedbackResponse(
  //   @Body() createFeedbackResponseDto: CreateFeedbackResponseDto,
  //   @Headers('authorization') jwt: string,
  // ) {
  //   const user = await this.userService.getUserByJwt(jwt);
  //   return this.feedbackResponseService.createFeedbackResponse(
  //     createFeedbackResponseDto,
  //     user.id,
  //   );
  // }

  // @Get(':feedbackResponseId/business/:businessId')
  // async getFeedbackResponseById(
  //   @Param('feedbackResponseId') feedbackResponseId: number,
  //   @Param('businessId') businessId: number,
  // ) {
  //   return this.feedbackResponseService.getFeedbackResponseById(
  //     feedbackResponseId,
  //     businessId,
  //   );
  // }

  // @Put(':id/status')
  // async updateFeedbackResponseStatus(
  //   @Param('id') feedbackResponseId: number,
  //   @Body('status') status: FeedbackStatus,
  // ) {
  //   return this.feedbackResponseService.updateFeedbackResponseStatus(
  //     feedbackResponseId,
  //     status,
  //   );
  // }
}
