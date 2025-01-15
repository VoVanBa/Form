import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorater/role.customize';
import { CreateResponseOnQuestionDto } from './dtos/create.response.on.question.dto';
import { ResponseSurveyService } from './response-survey.service';

@Controller('response-survey')
export class ResponseSurveyController {
  constructor(private readonly responseService: ResponseSurveyService) {}
  //   @Post('business/:businessId')
  //   //   @Roles('CUSTOMER')
  //   //   @UseGuards(JwtAuthGuard, RolesGuard)
  //   async saveGuestInfoAndResponsesNotAllowAnonymous(
  //     @Body() response: CreateResponseOnQuestionDto,
  //     @Headers('authorization') jwt: string,
  //     @Param('businessId', ParseIntPipe) businessId: number,
  //   ): Promise<any> {
  //     const user = await this.userService.getUserByJwt(jwt);
  //     const result =
  //       await this.responseService.saveGuestInfoAndResponsesNotAllowAnonymous(
  //         response,
  //         user.id,
  //         businessId,
  //       );
  //     return result;
  //   }
  @Post('form/:formId/business/:businessId')
  // @Roles('CUSTOMER')
  //   @UseGuards(JwtAuthGuard, RolesGuard)
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
    return this.responseService.getDetailedSurveyResponses(formId);
  }

  @Get(':formId')
  async getUserResponse(@Param('formId') formId: number) {
    return this.responseService.getUserResponse(formId);
  }

  @Get(':formId/detail')
  async getDetailResponesFromUser(@Param('formId') formId: number) {
    return this.responseService.getDetailResponesFromUser(formId);
  }
}
