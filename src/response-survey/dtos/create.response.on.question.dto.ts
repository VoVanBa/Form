import {
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  Max,
  Min,
} from 'class-validator';
import { GuestInfoDto } from './guest.info.dto';
import { UserResponseDto } from './user.response.dto';

export class CreateResponseOnQuestionDto {
  questionId: number;

  answerOptionId?: number;

  @IsString()
  @IsOptional()
  answerText?: string;

  @IsInt()
  @IsOptional()
  ratingValue?: number;

  @IsOptional()
  guestInfo?: GuestInfoDto;

  @IsOptional()
  responses?: UserResponseDto[];
}
