import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransferRequest {
  @ApiProperty({
    description: 'Monto trasladado entre cuentas',
    example: 500,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Descripcion opcional de la transferencia',
    example: 'Para ahorro mensual',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @ApiProperty({
    description: 'Fecha de la transferencia (formato ISO 8601)',
    example: '2026-05-20',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'ID de la cuenta origen',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  sourceAccountId: number;

  @ApiProperty({
    description: 'ID de la cuenta destino',
    example: 3,
  })
  @IsNumber()
  @IsNotEmpty()
  destinationAccountId: number;
}
