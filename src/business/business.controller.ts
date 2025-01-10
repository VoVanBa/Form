import {
  Body,
  Controller,
  Delete,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dtos/business.dto';
import { Roles } from 'src/auth/decorater/role.customize';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role-auth.guard';

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
    return this.businessService.create(createBusinessDto, user.id);
  }
  @Delete(':/businessId')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteById(@Param() businessId: number) {
    return this.businessService.deleteById(businessId);
  }
}
