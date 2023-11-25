import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { Post, Prisma, User } from '@prisma/client';
import { UpdatePostInput } from './dto/update-post.input';
import { PostSearchInput } from './dto/post-search.input';
import { RoleType } from 'src/role/entities/role.entity';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async createPostWithAuthor(
    createPostInput: Prisma.PostCreateInput,
  ): Promise<Post> {
    try {
      return await this.prisma.post.create({
        data: createPostInput,
        include: { author: true },
      });
    } catch (error) {
      throw new Error(`Error creating post: ${error.message}`);
    }
  }

  async findAll(): Promise<Post[]> {
    const posts = await this.prisma.post.findMany();
    if (posts.length === 0) {
      throw new NotFoundException('No posts found');
    }
    return posts;
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

  async updatePostWithAuthorization(
    postId: number,
    updateData: UpdatePostInput,
    currentUser: User,
  ): Promise<Post> {
    const post = await this.findOneById(postId);

    if (
      post.authorId !== currentUser.id &&
      currentUser.roleId !== RoleType.ADMIN
    ) {
      throw new Error('Unauthorized to update this post');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data: updateData,
    });
  }

  async deletePostWithAuthorization(postId: number, user: User): Promise<Post> {
    const post = await this.findOneById(postId);

    if (post.authorId !== user.id && user.roleId !== RoleType.ADMIN) {
      throw new Error('Unauthorized to delete this post');
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
