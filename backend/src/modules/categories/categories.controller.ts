import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { User } from '@/common/decorators/user.decorator';
import { CreateCategoryRequest } from './dto/create-category.dto';
import { Category } from '@/database/entities';
import { UpdateCategoryRequest } from './dto/update-category.dto';
import { JwtAccessGuard } from '@/common/jwt/access-token/jwt-access.guard';

@Controller('categories')
@UseGuards(JwtAccessGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(
    @User('id') userId: number,
    @Body() createCategoryRequest: CreateCategoryRequest,
  ): Promise<Category> {
    return this.categoriesService.create(userId, createCategoryRequest);
  }

  @Get()
  findAll(@User('id') userId: number): Promise<Category[]> {
    return this.categoriesService.findAll(userId);
  }

  @Get('global')
  findGlobal(): Promise<Category[]> {
    return this.categoriesService.findGlobal();
  }

  @Get(':id')
  findOne(
    @Param('id') id: number,
    @User('id') userId: number,
  ): Promise<Category> {
    return this.categoriesService.findOne(id, userId);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @User('id') userId: number,
    @Body() updateCategoryRequest: UpdateCategoryRequest,
  ): Promise<Category> {
    return this.categoriesService.update(id, userId, updateCategoryRequest);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: number, @User('id') userId: number): Promise<void> {
    return this.categoriesService.delete(id, userId);
  }
}
