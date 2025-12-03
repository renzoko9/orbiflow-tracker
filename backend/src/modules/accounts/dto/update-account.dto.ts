import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAccountRequest {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  balance?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
