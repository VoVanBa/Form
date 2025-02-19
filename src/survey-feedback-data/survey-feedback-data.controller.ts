import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CreateResponseOnQuestionDto } from './dtos/create.response.on.question.dto';
import { SurveyFeedbackDataService } from './survey-feedback-data.service';

@Controller('response')
export class SurveyFeedbackDataController {
  constructor(
    private readonly responseService: SurveyFeedbackDataService,
    private userService: UsersService,
  ) {}
  @Post('form/:formId/business/:businessId/save')
  async saveGuestInfoAndResponses(
    @Body() response: CreateResponseOnQuestionDto,
    @Headers('authorization') jwt: string | undefined,
    @Param('businessId') businessId: number,
    @Param('formId') formId: number,
  ): Promise<any> {
    let userId: number | null = null;
    const allowAnonymous =
      await this.responseService.getStatusAnonymous(formId);
    if (!allowAnonymous) {
      if (!jwt) {
        throw new UnauthorizedException(
          'JWT token is required for non-anonymous responses.',
        );
      }
      const user = await this.userService.getUserByJwt(jwt);
      userId = user.id;
    }

    const result = await this.responseService.saveGuestInfoAndResponses(
      businessId,
      formId,
      response,
      userId,
    );
    return result;
  }

  @Get(':formId/get-ratio')
  async getRatioSurveyResponse(
    @Param('formId') formId: number,
    @Query('option') option?: string,
    @Query('customStartDate') customStartDate?: string,
    @Query('customEndDate') customEndDate?: string,
  ) {
    return this.responseService.getFormRate(
      formId,
      option,
      customStartDate,
      customEndDate,
    );
  }

  @Get(':formId')
  async getUserResponse(@Param('formId') formId: number) {
    return this.responseService.getUserResponse(formId);
  }

  @Get(':formId/detail')
  async getDetailResponsesFromUser(
    @Param('formId') formId: number,
    @Query('option') option?: string,
    @Query('customStartDate') customStartDate?: string,
    @Query('customEndDate') customEndDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.responseService.getUserResponseDetails(
      formId,
      option,
      customStartDate,
      customEndDate,
      page,
      limit,
    );
  }

  @Get(':formId/feedback-responses')
  async getUserResponseDetails(
    @Param('formId') formId: number,
    @Query('username') username?: string,
  ) {
    if (!username) {
      throw new Error('Username query parameter is required.');
    }

    return this.responseService.getDetailResponsesByUsername(username, formId);
  }

  @Get(':formId/filter')
  async filterResponses(
    @Param('formId') formId: number,
    @Query('range') range: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const pageNum = parseInt(page, 10) || 1; // Default to page 1
    const pageSizeNum = parseInt(pageSize, 10) || 10; // Default to 10 items per page
    return this.responseService.filterResponsesByOption(
      formId,
      range,
      pageNum,
      pageSizeNum,
    );
  }
}
