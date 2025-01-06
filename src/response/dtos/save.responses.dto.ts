import { GuestInfoDto } from './guest.info.dto';
import { UserResponseDto } from './user.response.dto';

export class SaveResponsesDto {
  surveyResponseId: number;
  guestInfo: GuestInfoDto;
  responses: UserResponseDto[];
}
