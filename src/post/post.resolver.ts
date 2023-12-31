import { UseGuards } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PostService } from './post.service';
import { GqlAuthGuard } from 'src/auth/auth.guard';
import { GqlRolesGuard } from 'src/auth/role.guard';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post } from './types/post.types';
import { User } from 'src/user/types/user.types';
import { Prisma } from '@prisma/client';
import { PostSearchInput } from './dto/post-search.input';
import { PaginationInput } from './dto/pagination.input';
import { PostPaginationResult } from './types/post-pagination-result.types';
import { UserService } from 'src/user/user.service';
import { Category } from 'src/category/types/category.types';
import { CommentService } from 'src/comment/comment.service';
import { CategoryService } from 'src/category/category.service';
import { Comment } from 'src/comment/types/comment.types';

@Resolver(() => Post)
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UserService,
    private readonly commentService: CommentService,
    private readonly categoryService: CategoryService,
  ) {}

  @Mutation(() => Post, { description: '새로운 포스트를 생성합니다.' })
  @UseGuards(GqlAuthGuard)
  async createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @CurrentUser() user: User,
  ) {
    const prismaPostInput: Prisma.PostCreateInput = {
      ...createPostInput,
      author: { connect: { id: user.id } },
    };

    return this.postService.createPost(prismaPostInput);
  }

  @Query(() => PostPaginationResult, {
    description: '포스트 목록을 페이징하여 반환합니다.',
  })
  async listPosts(
    @Args('pagination', { type: () => PaginationInput })
    pagination: PaginationInput,
  ) {
    return this.postService.findAll(pagination);
  }

  @Query(() => Post, {
    name: 'viewPost',
    description: '특정 ID의 포스트를 조회합니다.',
  })
  async viewPost(@Args('id', { type: () => Int }) postId: number) {
    return this.postService.findOneById(postId);
  }

  @Mutation(() => Post, { description: '기존 포스트를 업데이트합니다.' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  async updatePost(
    @Args('postId', { type: () => Int }) postId: number,
    @Args('updateData') updateData: UpdatePostInput,
    @CurrentUser() currentUser: User,
  ) {
    const user = await this.userService.findById(currentUser.id);

    return this.postService.updatePost(postId, updateData, {
      id: user.id,
      roleId: user.roleId,
    });
  }

  @Mutation(() => Post, { description: '특정 포스트를 삭제합니다.' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  async deletePost(
    @Args('postId', { type: () => Int }) postId: number,
    @CurrentUser() currentUser: User,
  ) {
    const user = await this.userService.findById(currentUser.id);

    return this.postService.deletePost(postId, {
      id: user.id,
      roleId: user.roleId,
    });
  }

  @Query(() => PostPaginationResult, {
    description: '주어진 검색 조건에 따라 포스트를 검색합니다.',
  })
  async searchPosts(
    @Args('searchCriteria') searchCriteria: PostSearchInput,
    @Args('pagination', { type: () => PaginationInput })
    pagination: PaginationInput,
  ) {
    return this.postService.searchPosts(searchCriteria, pagination);
  }

  @Mutation(() => Post, { description: '포스트에 카테고리를 할당합니다.' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  async assignCategoryToPost(
    @Args('postId', { type: () => Int }) postId: number,
    @Args('categoryId', { type: () => Int }) categoryId: number,
  ) {
    return this.postService.assignCategoryToPost(postId, categoryId);
  }

  @Query(() => [Post], {
    description: '특정 카테고리에 속하는 포스트를 필터링합니다.',
  })
  async filterPostsByCategory(
    @Args('categoryId', { type: () => Int }) categoryId: number,
  ) {
    return this.postService.getPostsByCategory(categoryId);
  }

  @ResolveField('author', () => User)
  async getAuthor(@Parent() post: Post) {
    return this.userService.findById(post.authorId);
  }

  @ResolveField('comments', () => [Comment])
  async getComments(@Parent() post: Post) {
    return this.commentService.findCommentsByPostId(post.id);
  }

  @ResolveField('category', () => Category, { nullable: true })
  async getCategory(@Parent() post: Post) {
    return this.categoryService.findCategoryByPostId(post.id);
  }
}
