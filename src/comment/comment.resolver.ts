import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PostService } from 'src/post/post.service';
import { CommentService } from './comment.service';
import { UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateCommentInput } from './dto/create-comment.input';
import { GqlAuthGuard } from 'src/auth/auth.guard';
import { Comment } from './types/comment.types';
import { GqlRolesGuard } from 'src/auth/role.guard';

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

  @Query(() => [Comment], { name: 'listComments' })
  async listComments(@Args('postId', { type: () => Int }) postId: number) {
    const post = await this.postService.findPostByIdWithComments(postId);

    if (!post) {
      throw new Error(`Post with ID ${postId} not found.`);
    }

    return post.comments;
  }

  @Mutation(() => Comment)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  async updateComment(
    @Args('updateCommentInput') updateCommentInput: UpdateCommentInput,
    @CurrentUser() user: User,
  ) {
    const { id, content } = updateCommentInput;

    const comment = await this.commentService.findOne(id);

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.authorId !== user.id) {
      throw new Error('You are not authorized to update this comment');
    }

    return this.commentService.update(id, { content });
  }
}
