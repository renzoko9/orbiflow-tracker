import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from 'src/database/entities/category.entity';
import { CategoryRepository } from 'src/database/repositories/category.repository';
import { CreateCategoryRequest } from './dto/create-category.dto';
import { UpdateCategoryRequest } from './dto/update-category.dto';
import { IsNull } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(
    userId: number,
    createCategoryRequest: CreateCategoryRequest,
  ): Promise<Category> {
    const newCategory = this.categoryRepository.create({
      ...createCategoryRequest,
      user: { id: userId },
    });

    return this.categoryRepository.save(newCategory);
  }

  async findAll(userId: number): Promise<Category[]> {
    // Retorna categorias globales (user null) + categorias del usuario
    const categories = await this.categoryRepository.find({
      where: [{ user: IsNull() }, { user: { id: userId } }],
      order: {
        name: 'ASC',
      },
    });
    return categories;
  }

  async findGlobal(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { user: IsNull() },
      order: {
        name: 'ASC',
      },
    });
  }

  async findByUser(userId: number): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { user: { id: userId } },
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: number, userId: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: [
        { id, user: IsNull() },
        { id, user: { id: userId } },
      ],
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    return category;
  }

  async update(
    id: number,
    userId: number,
    updateCategoryRequest: UpdateCategoryRequest,
  ): Promise<Category> {
    // Solo se pueden actualizar categorias del usuario, no las globales
    const category = await this.categoryRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with id ${id} not found or you don't have permission to update it`,
      );
    }

    Object.assign(category, updateCategoryRequest);
    return this.categoryRepository.save(category);
  }

  async delete(id: number, userId: number): Promise<void> {
    // Solo se pueden eliminar categorias del usuario, no las globales
    const category = await this.categoryRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with id ${id} not found or you don't have permission to delete it`,
      );
    }

    await this.categoryRepository.remove(category);
  }
}
