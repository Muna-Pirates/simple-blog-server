import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { Comment, Prisma } from '@prisma/client';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  private async fetchComment(id: number): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: true,
        post: true,
      },
    });

    if (!comment) {
      throw new Error(`Comment with ID ${id} not found.`);
    }

    return comment;
  }

  async create(
    createCommentInput: Prisma.CommentCreateInput,
  ): Promise<Comment> {
    try {
      return await this.prisma.comment.create({
        data: createCommentInput,
        include: {
          author: true,
          post: true,
        },
      });
    } catch (error) {
      throw new Error('Failed to create comment');
    }
  }

  async findOne(id: number): Promise<Comment | null> {
    return this.fetchComment(id);
  }

  async update(id: number, updateData: { content: string }): Promise<Comment> {
    await this.fetchComment(id);
    return this.prisma.comment.update({
      where: { id },
      data: updateData,
      include: {
        author: true,
        post: true,
      },
    });
  }

  async remove(commentId: number): Promise<Comment> {
    await this.fetchComment(commentId);
    return this.prisma.comment.delete({
      where: { id: commentId },
      include: {
        author: true,
        post: true,
      },
    });
  }

  async listCommentsByPostId(postId: number): Promise<Comment[]> {
    return this.prisma.comment.findMany({
      where: { postId },
      include: {
        author: true,
        post: true,
      },
    });
  }
}
