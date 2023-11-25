import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PrismaService } from 'src/common/prisma.service';
import { CreatePostInput } from './dto/create-post.input';
import { User } from 'src/user/types/user.types';
import { Post } from 'src/post/types/post.types';
import { PostService } from './post.service';

@Resolver()
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Mutation(() => Post)
  @UseGuards(AuthGuard) // Apply RoleGuard here if needed
  async createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @CurrentUser() user: User,
  ): Promise<Post> {
    // Ensure that the current user's ID is included in the post creation
    const post = await this.postService.create({
      ...createPostInput,
      authorId: user.id,
    });
    return post;
  }
}
