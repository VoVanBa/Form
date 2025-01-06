import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ description: 'Tên người dùng hoặc email' })
  email: string;

  @ApiProperty({ description: 'Mật khẩu của người dùng' })
  password: string;
}
