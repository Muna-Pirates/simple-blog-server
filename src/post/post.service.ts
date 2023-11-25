import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { Post, Prisma } from '@prisma/client';
import { UpdatePostInput } from './dto/update-post.input';
import { PostSearchInput } from './dto/post-search.input';
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

  async update(postId: number, updateData: UpdatePostInput): Promise<Post> {
    return this.prisma.post.update({
      where: { id: postId },
      data: updateData,
    });
  }

  async remove(postId: number): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return post;
  }

  async searchPosts(criteria: PostSearchInput): Promise<Post[]> {
    const { title, content, authorId } = criteria;

    return this.prisma.post.findMany({
      where: {
        title: title ? { contains: title } : undefined,
        content: content ? { contains: content } : undefined,
        authorId: authorId || undefined,
      },
    });
  }
}
