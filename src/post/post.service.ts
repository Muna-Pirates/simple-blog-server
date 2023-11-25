import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { Post, Prisma } from '@prisma/client';
@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPostInput: Prisma.PostCreateInput): Promise<Post> {
    try {
      const post = await this.prisma.post.create({
        data: {
          ...createPostInput,
        },
        include: {
          author: true,
          comments: true,
        },
      });

      return post;
    } catch (error) {
      throw new Error(`Error creating post: ${error.message}`);
    }
  }
}
