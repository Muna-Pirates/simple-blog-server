import { Module } from '@nestjs/common';
import { CategoryResolver } from './category.resolver';
import { CategoryService } from './category.service';
import { PrismaService } from 'src/common/prisma.service';
import { PostService } from 'src/post/post.service';

@Module({
  providers: [CategoryResolver, CategoryService, PrismaService, PostService],
})
export class CategoryModule {}
