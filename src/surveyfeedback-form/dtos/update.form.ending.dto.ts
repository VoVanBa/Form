import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  IsInt,
} from 'class-validator';

export class UpdateFormEndingDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  endingMessage?: string;

  @IsOptional()
  @IsUrl()
  endingRedirectUrl?: string;

  @IsOptional()
  @IsInt()
  endingMediaId?: number;
}
