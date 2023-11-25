import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findAll(): Promise<Post[]> {
    try {
      const posts = await this.prisma.post.findMany();
      if (posts.length === 0) {
        throw new NotFoundException('No posts found');
      }
      return posts;
    } catch (error) {
      throw new NotFoundException('Error retrieving posts', error.message);
    }
  }

  async findOneById(postId: number): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    return post;
  }
}
