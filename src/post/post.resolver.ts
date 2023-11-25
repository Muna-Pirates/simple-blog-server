// src/post/post.resolver.ts
import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
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

@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Mutation(() => Post)
  @UseGuards(GqlAuthGuard)
  async createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @CurrentUser() user: User,
  ) {
    const prismaPostInput: Prisma.PostCreateInput = {
      ...createPostInput,
      author: { connect: { id: user.id } },
    };

    return this.postService.createPostWithAuthor(prismaPostInput);
  }

  @Query(() => [Post])
  async listPosts() {
    return this.postService.findAll();
  }

  @Query(() => Post, { name: 'viewPost' })
  async viewPost(@Args('id', { type: () => Int }) postId: number) {
    return this.postService.findOneById(postId);
  }

  @Mutation(() => Post)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  async updatePost(
    @Args('postId', { type: () => Int }) postId: number,
    @Args('updateData') updateData: UpdatePostInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.postService.updatePostWithAuthorization(postId, updateData, {
      id: currentUser.id,
      roleId: currentUser.roleId,
    });
  }

  @Mutation(() => Post)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  async deletePost(
    @Args('postId', { type: () => Int }) postId: number,
    @CurrentUser() user: User,
  ) {
    return this.postService.deletePostWithAuthorization(postId, {
      id: user.id,
      roleId: user.roleId,
    });
  }

  async searchPosts(@Args('searchCriteria') searchCriteria: PostSearchInput) {
    return this.postService.searchPosts(searchCriteria);
  }
}
