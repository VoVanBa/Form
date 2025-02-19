import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dtos/business.dto';
import { Roles } from 'src/common/decorater/role.customize';
import { UsersService } from 'src/users/users.service';
import { RolesGuard } from 'src/common/guards/role-auth.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('business')
export class BusinessController {
  constructor(
    private readonly businessService: BusinessService,
    private userService: UsersService,
  ) {}

  @Post()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createBusiness(
    @Body() createBusinessDto: CreateBusinessDto,
    @Headers('authorization') jwt: string,
  ) {
    const user = await this.userService.getUserByJwt(jwt);
    return await this.businessService.create(createBusinessDto, user.id);
  }
  @Delete(':/businessId')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteById(@Param() businessId: number) {
    return this.businessService.deleteById(businessId);
  }

  @Get(':businessId')
  async getId(@Param() businessId: number) {
    return this.businessService.getAll(businessId);
  }
}
