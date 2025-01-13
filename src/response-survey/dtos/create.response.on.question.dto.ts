import {
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  Max,
  Min,
  IsObject,
  IsArray,
} from 'class-validator';
import { GuestInfoDto } from './guest.info.dto';
import { UserResponseDto } from './user.response.dto';
import { ResponseDto } from './response.dto';

export class CreateResponseOnQuestionDto {
  @IsOptional()
  @IsObject()
  guestData?: GuestInfoDto;

  @IsArray()
  @IsOptional()
  responses: ResponseDto[];
}
