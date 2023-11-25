import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { Comment, Prisma } from 'prisma/prisma-client';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(
    createCommentInput: Prisma.CommentCreateInput,
  ): Promise<Comment> {
    try {
      return await this.prisma.comment.create({
        data: createCommentInput,
      });
    } catch (error) {
      throw new Error('Failed to create comment');
    }
  }

  async findOne(id: number): Promise<Comment | null> {
    return this.prisma.comment.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateData: { content: string }): Promise<Comment> {
    return this.prisma.comment.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(commentId: number) {
    return this.prisma.comment.delete({
      where: { id: commentId },
    });
  }
}
