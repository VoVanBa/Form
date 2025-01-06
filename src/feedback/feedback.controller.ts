import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackDto } from './dtos/feed.back.dto';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateFeedbackTemplateDto } from './dtos/create.feedback.template.dto';
import { RolesGuard } from 'src/auth/role-auth.guard';
import { AddFeedbackDto } from './dtos/add.feedback.dto';

@Controller('feedback')
export class FeedbackController {
  constructor(
    private feedbackService: FeedbackService,
    private userService: UsersService,
  ) {}

  // @Roles('CUSTOMER')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Post('upload-images')
  // @UseInterceptors(
  //   FilesInterceptor('files', 5, {
  //     limits: { fileSize: 5 * 1024 * 1024 },
  //     fileFilter: (req, file, callback) => {
  //       // Kiểm tra định dạng file
  //       if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
  //         return callback(
  //           new BadRequestException('Only image files are allowed!'),
  //           false,
  //         );
  //       }
  //       callback(null, true);
  //     },
  //   }),
  // )

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Post(':feedbackId/questions')
  // async addQuestion(
  //   @Param('feedbackId') feedbackId: number,
  //   @Body() addQuestionDto: AddFeedbackDto,
  // ) {
  //   return this.feedbackService.addAndUpdateFeedback(
  //     feedbackId,
  //     addQuestionDto,
  //   );
  // }

  // @Post('admin')
  // async createFeedbackTemplateByAdmin(
  //   @Body() createFeedbackTemplateDto: CreateFeedbackTemplateDto,
  // ) {
  //   return this.feedbackService.createFeedbackTemplateByAdmin(
  //     createFeedbackTemplateDto,
  //   );
  // }

  // @Get(':feedbackId')
  // async getFeedbackFormById(@Param('feedbackId') feedbackId: number) {
  //   return this.feedbackService.getFeedbackFormById(feedbackId);
  // }

  // @Post('/business/:businessId')
  // @UseGuards(JwtAuthGuard)
  // async createFeedbackFormByBusiness(
  //   @Body() createFeedbackTemplateDto: CreateFeedbackTemplateDto,
  //   @Headers('authorization') jwt: string,
  //   @Param('businessId') businessId: number,
  // ) {
  //   const user = await this.userService.getUserByJwt(jwt);
  //   return this.feedbackService.createFeedbackFormByBusiness(
  //     createFeedbackTemplateDto,
  //     businessId,
  //     user.id,
  //   );
  // }

  // @Roles('ADMIN')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Put(':id/status/:status')
  // async updateFeedbackStatus(
  //   @Headers('authorization') jwt: string,
  //   @Param('id', ParseIntPipe) id: number,
  //   @Param('status') status: FeedbackStatus,
  // ): Promise<any> {
  //   return this.feedbackService.updateFeedbackStatus(id, status);
  // }

  // @Get('search/:businessId')
  // // @Roles('ADMIN')
  // @UseGuards(
  //   // JwtAuthGuard,
  //   RolesGuard,
  // )
  // async getAllFeedBack(
  //   @Headers('authorization') jwt: string,
  //   @Query('page') page: string = '1',
  //   @Query('limit') limit: string = '10',
  //   @Query('key') key: string = '',
  //   @Param('businessId') businessId: number,
  // ): Promise<any> {
  //   const pageNumber = parseInt(page, 10);
  //   const limitNumber = parseInt(limit, 10);

  //   return this.feedbackService.getAllAndFindFeedBack(
  //     pageNumber,
  //     limitNumber,
  //     key,
  //     businessId,
  //   );
  // }

  // @Get('feedbackType/:businessId')
  // @UseGuards(JwtAuthGuard)
  // async getFeedBackType(
  //   @Headers('authorization') jwt: string,
  //   @Param('businessId') businessId: number,
  // ): Promise<any> {
  //   return this.feedbackService.getFeedBackType(businessId);
  // }

  // @Post('feedbackType/:businessId')
  // @Roles('ADMIN')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // async createFeedBackType(
  //   @Headers('authorization') jwt: string,
  //   @Param('businessId') businessId: number,
  //   @Body() createFeedBackType: CreateFeedBackType,
  // ): Promise<any> {
  //   return this.feedbackService.createFeedBackType(
  //     createFeedBackType,
  //     businessId,
  //   );
  // }

  // @Delete('delete/media/:mediaId')
  // @UseGuards(JwtAuthGuard)
  // async getQuantityFeedback(
  //   @Headers('authorization') jwt: string,
  //   @Param('mediaId') mediaId: number,
  // ): Promise<any> {
  //   return this.feedbackService.deleteMediaById(mediaId);
  // }

  // @Get('quantity-feedback')
  // @Roles('ADMIN')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // async getQuantityFeedback(
  //   @Headers('authorization') jwt: string,
  // ): Promise<any> {
  //   return this.feedbackService.getQuantityFeedback();
  // }

  // @Get('search')
  // @Roles('ADMIN')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // async searchFeedback(
  //   @Query('key') key: string,
  //   @Query('page') page: string = '1',
  //   @Query('limit') limit: string = '10',
  // ): Promise<any> {
  //   const currentPage = parseInt(page, 10);
  //   const pageSize = parseInt(limit, 10);
  //   return this.feedbackService.findFeedBackByNameAndEmail(
  //     key,
  //     currentPage,
  //     pageSize,
  //   );
  // }
}
