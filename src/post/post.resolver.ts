import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreatePostInput } from './dto/create-post.input';
import { User } from 'src/user/types/user.types';
import { Post } from 'src/post/types/post.types';
import { PostService } from './post.service';
import { GqlAuthGuard } from 'src/auth/auth.guard';
import { GqlRolesGuard } from 'src/auth/role.guard';
import { RoleType } from 'src/role/entities/role.entity';
import { UpdatePostInput } from './dto/update-post.input';

@Resolver()
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Mutation(() => Post)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  async createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @CurrentUser() user: User,
  ) {
    const post = await this.postService.create({
      ...createPostInput,
      author: {
        connect: {
          id: user.id,
        },
      },
    });

    return post;
  }

  @Query(() => [Post])
  async listPosts() {
    return this.postService.findAll();
  }

  @Query(() => Post, { name: 'viewPost' })
  async viewPost(@Args('id', { type: () => Int }) postId: number) {
    const post = await this.postService.findOneById(postId);

    return post;
  }

  @Mutation(() => Post)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  async updatePost(
    @Args('postId', { type: () => Int }) postId: number,
    @Args('updateData') updateData: UpdatePostInput,
    @CurrentUser() currentUser: User,
  ) {
    const post = await this.postService.findOneById(postId);

    if (!post) {
      throw new Error('Post not found');
    }

    if (
      post.authorId !== currentUser.id &&
      currentUser.roleId === RoleType.ADMIN
    ) {
      throw new Error('Unauthorized to update this post');
    }

    return this.postService.update(postId, updateData);
  }
}
