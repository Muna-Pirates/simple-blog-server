import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreatePostInput } from './dto/create-post.input';
import { User } from 'src/user/types/user.types';
import { Post } from 'src/post/types/post.types';
import { PostService } from './post.service';

@Resolver()
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Mutation(() => Post)
  @UseGuards(AuthGuard)
  async createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @CurrentUser() user: User,
  ): Promise<Post> {
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
}
