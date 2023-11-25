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
}
