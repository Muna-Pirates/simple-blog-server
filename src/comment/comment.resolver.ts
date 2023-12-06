import {
  Args,
  Int,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
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
import { PubSub } from 'graphql-subscriptions';
import { PubSubService } from 'src/common/pubsub.service';

@Resolver()
export class CommentResolver {
  constructor(
    private readonly commentService: CommentService,
    private readonly postService: PostService,
    private readonly pubSubService: PubSubService,
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

    delete createCommentInput.postId;

    const comment = await this.commentService.create({
      ...createCommentInput,
      author: { connect: { id: user.id } },
      post: { connect: { id: post.id } },
    });

    this.pubSubService.publish('onCommentAdded', {
      onCommentAdded: comment,
    });

    return comment;
  }

  @Query(() => [Comment], { name: 'listComments' })
  async listComments(@Args('postId', { type: () => Int }) postId: number) {
    return this.commentService.listCommentsByPostId(postId);
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

  @Subscription(() => Comment, {
    name: 'onCommentAdded',
    filter: (payload, variables) => {
      return payload.onCommentAdded.postId === variables.postId;
    },
  })
  onCommentAdded(@Args('postId', { type: () => Int }) postId: number) {
    return this.pubSubService.asyncIterator<Comment>('onCommentAdded');
  }
}
