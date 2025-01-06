import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendMailDto {
  readonly email: string;

  readonly customerNames: string;

  readonly subject: string;

  readonly text: string;

  readonly html?: string;

  solution: string;
}
