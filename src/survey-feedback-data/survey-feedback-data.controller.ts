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
import { Roles } from 'src/auth/decorater/role.customize';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role-auth.guard';
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
    const allowAnonymous = this.responseService.getStatusAnonymous(formId);
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
  async getRatioSurveyResponse(@Param('formId') formId: number) {
    return this.responseService.getFormRate(formId);
  }

  @Get(':formId')
  async getUserResponse(@Param('formId') formId: number) {
    return this.responseService.getUserResponse(formId);
  }

  @Get(':formId/detail')
  async getDetailResponsesFromUser(
    @Param('formId') formId: number,
    @Query('cursor') cursor?: number,
    @Query('limit') limit: number = 10,
  ) {
    return this.responseService.getUserResponseDetails(formId, cursor, limit);
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
}
