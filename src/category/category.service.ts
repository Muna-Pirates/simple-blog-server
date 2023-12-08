import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { CreateCategoryInput } from './dto/create-category.input';
import { Category } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryInput: CreateCategoryInput): Promise<Category> {
    try {
      if (!createCategoryInput.name || createCategoryInput.name.trim() === '') {
        throw new Error('Category name cannot be empty');
      }

      const category = await this.prisma.category.create({
        data: {
          name: createCategoryInput.name,
        },
      });

      return category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async findCategoryByPostId(postId: number): Promise<Category> {
    try {
      const category = await this.prisma.category.findFirst({
        where: {
          posts: {
            some: {
              id: postId,
            },
          },
        },
      });

      return category;
    } catch (error) {
      console.error('Error finding category by post id:', error);
      throw error;
    }
  }
}
