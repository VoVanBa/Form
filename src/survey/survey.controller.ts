import { Headers, ParseIntPipe } from '@nestjs/common';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SurveyService } from './survey.service';
import { RolesGuard } from 'src/auth/role-auth.guard';
import { Roles } from 'src/auth/decorater/role.customize';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  // @Roles('ADMIN')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Post('/:businessId')
  // async createSurvey(
  //   @Headers('authorization') jwt: string,
  //   @Body() createSurvey: CreateSurveyDto,
  //   @Param('businessId', ParseIntPipe) businessId: number,
  // ) {
  //   return this.surveyService.createSurveyByBusiness(createSurvey, businessId);
  // }

  // // @Roles('ADMIN')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Post('')
  // async createSurveyByAdmin(@Body() createSurvey: CreateSurveyDto) {
  //   return this.surveyService.createSurveyByAdmin(createSurvey);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get('/:surveyId/business/:businessId')
  // async getSurveyById(
  //   @Headers('authorization') jwt: string,
  //   @Param('surveyId', ParseIntPipe) surveyId: number,
  //   @Param('businessId', ParseIntPipe) businessId: number,
  // ) {
  //   return this.surveyService.getSurveyById(surveyId, businessId);
  // }
  // @Roles('ADMIN')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Put(':surveyId/business/:businessId/settings')
  // async updateSurveySettings(
  //   @Param('surveyId') surveyId: number,
  //   @Param('businessId') businessId: number,
  //   @Body() body: { settings: { key: string; value: any }[] },
  // ) {
  //   if (!Array.isArray(body.settings) || body.settings.length === 0) {
  //     throw new BadRequestException('Settings must be a non-empty array');
  //   }
  //   await this.surveyService.updateSurveySettings(
  //     surveyId,
  //     businessId,
  //     body.settings,
  //   );
  //   return { message: 'Survey settings updated successfully' };
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get('/:surveyId/business/:businessId/settings')
  // async getSettingSurveyById(
  //   @Headers('authorization') jwt: string,
  //   @Param('surveyId', ParseIntPipe) surveyId: number,
  //   @Param('businessId') businessId: number,
  // ) {
  //   return this.surveyService.getBusinessSurveySettings(surveyId, businessId);
  // }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Get('business/:businessId')
  // async getAllSurveys(@Param('businessId') businessId: number) {
  //   return this.surveyService.getAllSurvey(businessId);
  // }

  // @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // async getAllSurveyTemplate() {
  //   return this.surveyService.getAllSurveyTemplate();
  // }

  // @Put(':id/allow-anonymous')
  // async updateSurveyallowAnonymous(
  //   @Param('id') surveyId: number,
  //   @Body('allowAnonymous') allowAnonymous: boolean,
  // ) {
  //   return this.surveyService.updateSurveyallowAnonymous(
  //     surveyId,
  //     allowAnonymous,
  //   );
  // }

  // @Put(':id/status')
  // async updateSurveyStatus(
  //   @Param('id') surveyId: number,
  //   @Body('status') status: SurveyStatus,
  // ) {
  //   return this.surveyService.updateSurveyStatus(surveyId, status);
  // }

  // @Put(':id/business/:businessId')
  // async selectedSurvey(
  //   @Param('id') surveyId: number,
  //   @Param('businessId') businessId: number,
  // ) {
  //   return this.surveyService.selectedSurvey(surveyId, businessId);
  // }
}
