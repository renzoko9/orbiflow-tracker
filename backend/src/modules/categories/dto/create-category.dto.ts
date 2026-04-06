import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CategoryTypeEnum } from '@Enums';
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
    enum: CategoryTypeEnum,
    example: CategoryTypeEnum.Expense,
  })
  @IsEnum(CategoryTypeEnum)
  @IsNotEmpty()
  type: CategoryTypeEnum;

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
