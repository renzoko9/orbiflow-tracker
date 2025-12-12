import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CategoryType } from 'src/common/enum/category-type.enum';
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
    enum: CategoryType,
    example: CategoryType.EXPENSE,
  })
  @IsEnum(CategoryType)
  @IsNotEmpty()
  type: CategoryType;
}
