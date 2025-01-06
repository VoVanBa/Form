import { IsString, IsEmail, IsOptional } from 'class-validator';

export class GuestInfoDto {
  @IsString()
  name?: string;

  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
