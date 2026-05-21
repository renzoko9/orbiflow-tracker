import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTransferRequest {
  @ApiProperty({
    description: 'Monto trasladado entre cuentas',
    example: 600,
    required: false,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  amount?: number;

  @ApiProperty({
    description: 'Descripcion opcional de la transferencia',
    example: 'Reajuste',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @ApiProperty({
    description: 'Fecha de la transferencia (formato ISO 8601)',
    example: '2026-05-21',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({
    description: 'ID de la cuenta origen',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  sourceAccountId?: number;

  @ApiProperty({
    description: 'ID de la cuenta destino',
    example: 3,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  destinationAccountId?: number;
}
