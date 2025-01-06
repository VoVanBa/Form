import { IsInt, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateFeedBackType {
  @IsString()
  @IsOptional()
  typeName: string;
}
