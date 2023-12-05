import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { Post, Prisma } from '@prisma/client';
import { UpdatePostInput } from './dto/update-post.input';
import { PostSearchInput } from './dto/post-search.input';
import { RoleType } from 'src/role/entities/role.entity';
import { PaginationInput } from './dto/pagination.input';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  private async findPostOrThrow(postId: number): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    return post;
  }

  private checkAuthorization(post: Post, userId: number, roleId: number) {
    if (post.authorId !== userId && roleId !== RoleType.ADMIN) {
      throw new UnauthorizedException('Unauthorized action on this post');
    }
  }

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

  async findAll(pagination: PaginationInput) {
    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;

    const posts = await this.prisma.post.findMany({
      skip,
      take: pageSize,
      include: { author: true },
    });

    const totalItems = await this.prisma.post.count();

    if (posts.length === 0) {
      throw new NotFoundException('No posts found');
    }

    return {
      posts,
      pagination: {
        page,
        pageSize,
        totalItems,
      },
    };
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
    user: { id: number; roleId: number },
  ): Promise<Post> {
    const post = await this.findPostOrThrow(postId);
    this.checkAuthorization(post, user.id, user.roleId);

    return this.prisma.post.update({
      where: { id: postId },
      data: updateData,
    });
  }

  async deletePostWithAuthorization(
    postId: number,
    user: { id: number; roleId: number },
  ): Promise<Post> {
    const post = await this.findPostOrThrow(postId);
    this.checkAuthorization(post, user.id, user.roleId);

    return this.prisma.post.delete({
      where: { id: postId },
    });
  }

  async searchPosts(criteria: PostSearchInput, pagination: PaginationInput) {
    const { title, content, authorId } = criteria;
    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;

    const whereClause = {
      title: title ? { contains: title } : undefined,
      content: content ? { contains: content } : undefined,
      authorId: authorId || undefined,
    };

    const posts = await this.prisma.post.findMany({
      where: whereClause,
      skip,
      take: pageSize,
      include: { author: true },
    });

    const totalItems = await this.prisma.post.count({ where: whereClause });

    if (posts.length === 0) {
      throw new NotFoundException('No posts found');
    }

    return {
      posts,
      pagination: {
        page,
        pageSize,
        totalItems,
      },
    };
  }

  async findPostByIdWithComments(postId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { comments: true },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    return post;
  }

  async assignCategoryToPost(
    postId: number,
    categoryId: number,
  ): Promise<Post> {
    return this.prisma.post.update({
      where: { id: postId },
      data: { categoryId },
    });
  }

  async filterPostsByCategory(categoryId: number): Promise<Post[]> {
    return this.prisma.post.findMany({
      where: { categoryId },
      include: { author: true, comments: true },
    });
  }
}
