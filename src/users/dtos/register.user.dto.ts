import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ description: 'Tên người dùng', uniqueItems: true })
  username: string;

  @ApiProperty({ description: 'Mật khẩu của người dùng' })
  password: string;

  @ApiProperty({ description: 'Email của người dùng', uniqueItems: true })
  email: string;
}
