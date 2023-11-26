import { Module } from '@nestjs/common';
import { CategoryResolver } from './category.resolver';
import { CategoryService } from './category.service';
import { PrismaService } from 'src/common/prisma.service';

@Module({
  providers: [CategoryResolver, CategoryService, PrismaService],
})
export class CategoryModule {}
