import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { Comment, Prisma } from '@prisma/client';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  private async fetchComment(id: number): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new Error(`Comment with ID ${id} not found.`);
    }
    return comment;
  }

  async create(
    createCommentInput: Prisma.CommentCreateInput,
  ): Promise<Comment> {
    try {
      return await this.prisma.comment.create({ data: createCommentInput });
    } catch (error) {
      throw new Error('Failed to create comment');
    }
  }

  async findOne(id: number): Promise<Comment | null> {
    return this.fetchComment(id);
  }

  async update(id: number, updateData: { content: string }): Promise<Comment> {
    await this.fetchComment(id);
    return this.prisma.comment.update({ where: { id }, data: updateData });
  }

  async remove(commentId: number): Promise<Comment> {
    await this.fetchComment(commentId);
    return this.prisma.comment.delete({ where: { id: commentId } });
  }
}
