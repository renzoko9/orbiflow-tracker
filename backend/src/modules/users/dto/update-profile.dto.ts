import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const SUPPORTED_CURRENCY_CODES = [
  'PEN',
  'USD',
  'EUR',
  'MXN',
  'COP',
  'CLP',
  'ARS',
  'BRL',
  'GBP',
] as const;

export class UpdateProfileRequest {
  @ApiProperty({ required: false, example: 'Renzo' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty({ required: false, example: 'Jorge' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  lastname?: string;

  @ApiProperty({ required: false, example: 'PEN', enum: SUPPORTED_CURRENCY_CODES })
  @IsOptional()
  @IsIn(SUPPORTED_CURRENCY_CODES)
  currency?: string;
}
