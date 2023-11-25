import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PostService } from 'src/post/post.service';
import { CommentService } from './comment.service';
import { UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateCommentInput } from './dto/create-comment.input';
import { GqlAuthGuard } from 'src/auth/auth.guard';
import { Comment } from './types/comment.types';

@Resolver()
export class CommentResolver {
  constructor(
    private readonly commentService: CommentService,
    private readonly postService: PostService,
  ) {}

  @Mutation(() => Comment)
  @UseGuards(GqlAuthGuard)
  async addComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
    @CurrentUser() user: User,
  ) {
    const post = await this.postService.findOneById(createCommentInput.postId);

    if (!post) {
      throw new Error('Post not found');
    }

    return this.commentService.create({
      ...createCommentInput,
      author: { connect: { id: user.id } },
      post: { connect: { id: post.id } },
    });
  }
}
