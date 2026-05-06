import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
