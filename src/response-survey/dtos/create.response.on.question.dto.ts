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
  @IsInt()
  formId: number;

  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsObject()
  guestData?: GuestInfoDto;

  @IsArray()
  @IsOptional()
  responses: ResponseDto[];
}
