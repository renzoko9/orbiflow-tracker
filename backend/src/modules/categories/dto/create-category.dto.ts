import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TransactionTypeEnum } from '@Enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryRequest {
  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Alimentación',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Tipo de categoría',
    enum: TransactionTypeEnum,
    example: TransactionTypeEnum.Expense,
  })
  @IsEnum(TransactionTypeEnum)
  @IsNotEmpty()
  type: TransactionTypeEnum;

  @ApiProperty({
    description: 'Nombre del icono (lucide icon name)',
    example: 'shopping-cart',
  })
  @IsString()
  @IsNotEmpty()
  icon: string;

  @ApiProperty({
    description: 'Color en formato hexadecimal',
    example: '#ef4444',
  })
  @IsString()
  @IsNotEmpty()
  color: string;
}
