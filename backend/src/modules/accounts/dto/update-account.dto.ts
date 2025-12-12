import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountRequest {
  @ApiProperty({
    description: 'Nombre de la cuenta',
    example: 'Cuenta Corriente',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Balance de la cuenta',
    example: 1500,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  balance?: number;

  @ApiProperty({
    description: 'Descripción de la cuenta',
    example: 'Cuenta para ahorros',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
