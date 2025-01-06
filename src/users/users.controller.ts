import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/decorater/role.customize';
import { RolesGuard } from 'src/auth/role-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('/find-by-id')
  @UseGuards(JwtAuthGuard)
  async findAllUserById(@Headers('authorization') jwt: string): Promise<any> {
    const user = this.userService.getUserByJwt(jwt);
    if (!user) {
      throw new BadRequestException('user not exiting');
    }
    return this.userService.getUserById((await user).id);
  }
}
