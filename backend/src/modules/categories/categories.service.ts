import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from '@Entities';
import { CategoryRepository } from '@Repositories';
import { CreateCategoryRequest } from './dto/create-category.dto';
import { UpdateCategoryRequest } from './dto/update-category.dto';
import { IsNull, Not } from 'typeorm';
import { ErrorCodeEnum, ResponseTypeEnum } from '@Enums';
import { ResponseAPI } from '@/common/interfaces/response.interface';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(
    userId: number,
    createCategoryRequest: CreateCategoryRequest,
  ): Promise<ResponseAPI<Category>> {
    const newCategory = this.categoryRepository.create({
      ...createCategoryRequest,
      user: { id: userId },
    });

    const saved = await this.categoryRepository.save(newCategory);

    return {
      responseType: ResponseTypeEnum.Success,
      message: 'Categoría creada exitosamente',
      data: saved,
    };
  }

  async findAll(userId: number): Promise<Category[]> {
    // Globales (user null) + categorías del usuario que NO esten archivadas
    const categories = await this.categoryRepository.find({
      where: [
        { user: IsNull() },
        { user: { id: userId }, archivedAt: IsNull() },
      ],
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

  async findArchived(userId: number): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { user: { id: userId }, archivedAt: Not(IsNull()) },
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
      throw new NotFoundException({
        message: `Category with id ${id} not found`,
        errorCode: ErrorCodeEnum.CATEGORY_NOT_FOUND,
      });
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
      throw new NotFoundException({
        message: `Category with id ${id} not found or you don't have permission to update it`,
        errorCode: ErrorCodeEnum.CATEGORY_NOT_FOUND,
      });
    }

    Object.assign(category, updateCategoryRequest);
    return this.categoryRepository.save(category);
  }

  async archive(id: number, userId: number): Promise<Category> {
    // Solo se pueden archivar categorias del usuario, no las globales
    const category = await this.categoryRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!category) {
      throw new NotFoundException({
        message: `Category with id ${id} not found or you don't have permission to archive it`,
        errorCode: ErrorCodeEnum.CATEGORY_NOT_FOUND,
      });
    }

    if (category.archivedAt !== null) {
      return category;
    }

    category.archivedAt = new Date();
    return this.categoryRepository.save(category);
  }

  async restore(id: number, userId: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!category) {
      throw new NotFoundException({
        message: `Category with id ${id} not found or you don't have permission to restore it`,
        errorCode: ErrorCodeEnum.CATEGORY_NOT_FOUND,
      });
    }

    if (category.archivedAt === null) {
      return category;
    }

    category.archivedAt = null;
    return this.categoryRepository.save(category);
  }
}
