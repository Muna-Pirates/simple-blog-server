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
import { UpdateCommentInput } from './dto/update-comment.input';
import { RoleType } from 'src/role/entities/role.entity';

@Resolver()
export class CommentResolver {
  constructor(
    private readonly commentService: CommentService,
    private readonly postService: PostService,
  ) {}

  private throwIfNotFound(item: any, itemName: string, id?: number): void {
    if (!item) {
      throw new Error(`${itemName} not found${id ? ` with ID ${id}` : ''}.`);
    }
  }

  @Mutation(() => Comment)
  @UseGuards(GqlAuthGuard)
  async addComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
    @CurrentUser() user: User,
  ) {
    const post = await this.postService.findOneById(createCommentInput.postId);
    this.throwIfNotFound(post, 'Post', createCommentInput.postId);

    return this.commentService.create({
      ...createCommentInput,
      author: { connect: { id: user.id } },
      post: { connect: { id: post.id } },
    });
  }

  @Query(() => [Comment], { name: 'listComments' })
  async listComments(@Args('postId', { type: () => Int }) postId: number) {
    const post = await this.postService.findPostByIdWithComments(postId);
    this.throwIfNotFound(post, 'Post', postId);

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
    this.throwIfNotFound(comment, 'Comment', id);

    if (comment.authorId !== user.id) {
      throw new Error('You are not authorized to update this comment');
    }

    return this.commentService.update(id, { content });
  }

  @Mutation(() => Comment)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  async deleteComment(
    @Args('commentId', { type: () => Int }) commentId: number,
    @CurrentUser() currentUser: User,
  ) {
    const comment = await this.commentService.findOne(commentId);
    this.throwIfNotFound(comment, 'Comment', commentId);

    if (
      comment.authorId !== currentUser.id &&
      currentUser.roleId !== RoleType.ADMIN
    ) {
      throw new Error('Unauthorized access');
    }

    return this.commentService.remove(commentId);
  }
}
