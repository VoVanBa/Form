import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorater/role.customize';
import { CreateResponseOnQuestionDto } from './dtos/create.response.on.question.dto';
import { ResponseSurveyService } from './response-survey.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role-auth.guard';
import { UsersService } from 'src/users/users.service';

@Controller('response-survey')
export class ResponseSurveyController {
  constructor(
    private readonly responseService: ResponseSurveyService,
    private userService: UsersService,
  ) {}
  @Post('form/:formId/business/:businessId/')
  @Roles('CUSTOMER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async saveGuestInfoAndResponsesNotAllowAnonymous(
    @Body() response: CreateResponseOnQuestionDto,
    @Headers('authorization') jwt: string,
    @Param('businessId') businessId: number,
    @Param('formId') formId: number,
  ): Promise<any> {
    const user = await this.userService.getUserByJwt(jwt);
    const result =
      await this.responseService.saveGuestInfoAndResponsesNotAllowAnonymous(
        businessId,
        formId,
        response,
        user.id,
      );
    return result;
  }

  @Post('form/:formId/business/:businessId/allowAnonymous')
  async saveGuestInfoAndResponsesAllowAnonymous(
    @Body() response: CreateResponseOnQuestionDto,
    @Param('businessId') businessId: number,
    @Param('formId') formId: number,
  ): Promise<any> {
    const result =
      await this.responseService.saveGuestInfoAndResponsesAllowAnonymous(
        businessId,
        formId,
        response,
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
  async getDetailResponesFromUser(@Param('formId') formId: number) {
    return this.responseService.getUserResponseDetails(formId);
  }
}
