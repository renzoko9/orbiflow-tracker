import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountRequest {
  @ApiProperty({
    description: 'Nombre de la cuenta',
    example: 'Cuenta Corriente',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Balance inicial de la cuenta',
    example: 1000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  balance?: number;

  @ApiProperty({
    description: 'Descripción de la cuenta',
    example: 'Cuenta principal para gastos diarios',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Icono de la cuenta (nombre de lucide icon)',
    example: 'wallet',
    required: false,
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({
    description: 'Color de la cuenta en formato hexadecimal',
    example: '#77a8a8',
    required: false,
  })
  @IsString()
  @IsOptional()
  color?: string;
}
