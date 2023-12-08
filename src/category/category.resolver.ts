import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { Post, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/auth.guard';
import { GqlRolesGuard } from 'src/auth/role.guard';
import { Category } from './types/category.types';
import { CreateCategoryInput } from './dto/create-category.input';
import { PostService } from 'src/post/post.service';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly postService: PostService,
  ) {}

  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  async createCategory(
    @Args('createCategoryInput') createCategoryInput: CreateCategoryInput,
  ) {
    return this.categoryService.create(createCategoryInput);
  }

  @ResolveField(() => [Post])
  async posts(@Parent() category: Category) {
    const { id } = category;
    return this.postService.getPostsByCategory(id);
  }
}
