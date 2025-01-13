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

  @IsInt()
  @IsOptional()
  answerOptionId?: number;

  @IsString()
  @IsOptional()
  answerText?: string;

  @IsInt()
  @IsOptional()
  ratingValue?: number;

  guestInfo?: GuestInfoDto;
  responses?: UserResponseDto[];
}
