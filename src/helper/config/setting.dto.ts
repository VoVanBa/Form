import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

class Setting {
  @IsBoolean()
  enabled: boolean;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  date?: string;

  @IsNumber()
  @IsOptional()
  position?: number;

  constructor(
    enabled: boolean,
    limit?: number,
    date?: string,
    position?: number,
  ) {
    this.enabled = enabled;
    this.limit = limit;
    this.date = date;
    this.position = position;
  }
}

export default Setting;
