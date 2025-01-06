import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ResponseService } from './response.service';
import { RolesGuard } from 'src/auth/role-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';
import { SaveResponsesDto } from './dtos/save.responses.dto';
import { Roles } from 'src/auth/decorater/role.customize';

@Controller('response')
export class ResponseController {
  constructor(
    private readonly responseService: ResponseService,
    private userService: UsersService,
  ) {}

  // @Get('/:surveyId/business/:businessId')
  // // @Roles('ADMIN')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // async getResponseBySurveyId(
  //   @Param('surveyId', ParseIntPipe) surveyId: number,
  //   @Param('businessId', ParseIntPipe) businessId: number,
  // ): Promise<any> {
  //   const result = await this.responseService.getSurveyResponseById(
  //     surveyId,
  //     businessId,
  //   );
  //   return result;
  // }
  // @Post('/save-guest-info/business/:businessId')
  // // @Roles('CUSTOMER')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // async saveGuestInfoAndResponsesAllowAnonymous(
  //   @Body() response: SaveResponsesDto,
  //   @Param('businessId', ParseIntPipe) businessId: number,
  // ): Promise<any> {
  //   const result =
  //     await this.responseService.saveGuestInfoAndResponsesAllowAnonymous(
  //       businessId,
  //       response,
  //     );
  //   return result;
  // }

  // @Post('business/:businessId')
  // @Roles('CUSTOMER')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // async saveGuestInfoAndResponsesNotAllowAnonymous(
  //   @Body() response: SaveResponsesDto,
  //   @Headers('authorization') jwt: string,
  //   @Param('businessId', ParseIntPipe) businessId: number,
  // ): Promise<any> {
  //   const user = await this.userService.getUserByJwt(jwt);
  //   const result =
  //     await this.responseService.saveGuestInfoAndResponsesNotAllowAnonymous(
  //       response,
  //       user.id,
  //       businessId,
  //     );
  //   return result;
  // }

  // @Get('survey/:surveyId/business/:businessId')
  // async userResponseBySurveyId(
  //   @Param('surveyId') surveyId: number,
  //   @Param('businessId') businessId: number,
  // ) {
  //   return this.responseService.userResponseBySurveyId(surveyId, businessId);
  // }

  // @Get('survey/:surveyId/business/:businessId/ratio')
  // async getRatioSurveyResponseByBusinessId(
  //   @Param('surveyId') surveyId: number,
  //   @Param('businessId') businessId: number,
  // ) {
  //   return this.responseService.getRatioSurveyResponseByBusinessId(
  //     businessId,
  //     surveyId,
  //   );
  // }
}
