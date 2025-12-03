import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CategoryType } from 'src/common/enum/category-type.enum';

export class CreateCategoryRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(CategoryType)
  @IsNotEmpty()
  type: CategoryType;
}
