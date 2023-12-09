import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { Post as PrismaPost, Prisma, User } from '@prisma/client';
import { UpdatePostInput } from './dto/update-post.input';
import { PostSearchInput } from './dto/post-search.input';
import { RoleType } from 'src/role/entities/role.entity';
import { PaginationInput } from './dto/pagination.input';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  private async findEntityOrThrow(
    entity: 'post' | 'user',
    where: Prisma.PostWhereUniqueInput | Prisma.UserWhereUniqueInput,
    errorMessage: string,
  ): Promise<PrismaPost | User> {
    if (entity === 'post') {
      const post = await this.prisma.post.findUnique({
        where: where as Prisma.PostWhereUniqueInput,
      });
      if (!post) throw new NotFoundException(errorMessage);
      return post as PrismaPost;
    } else {
      const user = await this.prisma.user.findUnique({
        where: where as Prisma.UserWhereUniqueInput,
      });
      if (!user) throw new NotFoundException(errorMessage);
      return user as User;
    }
  }

  private async checkAuthorization(
    post: PrismaPost | User,
    userId: number,
    roleId: number,
  ): Promise<void> {
    if (!('title' in post && 'content' in post)) {
      throw new Error('Invalid post object provided');
    }

    if (post.authorId !== userId && roleId !== RoleType.ADMIN) {
      throw new UnauthorizedException('Unauthorized action on this post');
    }
  }

  async createPost(
    createPostInput: Prisma.PostCreateInput,
  ): Promise<PrismaPost> {
    return this.prisma.post.create({
      data: createPostInput,
      include: { author: true },
    });
  }

  private getPaginationDetails(pagination: PaginationInput) {
    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;
    return { skip, take: pageSize };
  }

  async findAll(pagination: PaginationInput) {
    const paginationDetails = this.getPaginationDetails(pagination);
    const posts = await this.prisma.post.findMany({
      ...paginationDetails,
      include: { author: true, comments: true, category: true },
    });
    const totalItems = await this.prisma.post.count();
    return { posts, pagination: { ...pagination, totalItems } };
  }

  async findOneById(postId: number): Promise<PrismaPost> {
    return this.findEntityOrThrow(
      'post',
      { id: postId },
      `Post with ID ${postId} not found.`,
    ) as Promise<PrismaPost>;
  }

  async updatePost(
    postId: number,
    updateData: UpdatePostInput,
    user: { id: number; roleId: number },
  ): Promise<PrismaPost> {
    const post = await this.findEntityOrThrow(
      'post',
      { id: postId },
      `Post with ID ${postId} not found.`,
    );

    // Type guard to ensure post is PrismaPost
    if (!('title' in post && 'content' in post)) {
      throw new Error('Invalid post object provided');
    }

    await this.checkAuthorization(post, user.id, user.roleId);
    return this.prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: { author: true, comments: true, category: true },
    });
  }

  async deletePost(
    postId: number,
    user: { id: number; roleId: number },
  ): Promise<PrismaPost> {
    const post = await this.findEntityOrThrow(
      'post',
      { id: postId },
      `Post with ID ${postId} not found.`,
    );
    await this.checkAuthorization(post, user.id, user.roleId);
    return this.prisma.post.delete({
      where: { id: postId },
      include: { author: true, comments: true, category: true },
    });
  }

  async searchPosts(criteria: PostSearchInput, pagination: PaginationInput) {
    const { title, content, authorId } = criteria;
    const paginationDetails = this.getPaginationDetails(pagination);
    const whereClause: Prisma.PostWhereInput = {
      title: title ? { contains: title } : undefined,
      content: content ? { contains: content } : undefined,
      authorId: authorId || undefined,
    };
    const posts = await this.prisma.post.findMany({
      where: whereClause,
      ...paginationDetails,
      include: { author: true, comments: true, category: true },
    });
    const totalItems = await this.prisma.post.count({ where: whereClause });
    return { posts, pagination: { ...pagination, totalItems } };
  }

  async assignCategoryToPost(
    postId: number,
    categoryId: number,
  ): Promise<PrismaPost> {
    return this.prisma.post.update({
      where: { id: postId },
      data: { categoryId },
      include: { category: true },
    });
  }

  async getUserPosts(userId: number): Promise<PrismaPost[]> {
    const user = await this.findEntityOrThrow(
      'user',
      { id: userId },
      `User with ID ${userId} not found.`,
    );
    return this.prisma.post.findMany({ where: { authorId: user.id } });
  }

  async getPostsByCategory(categoryId: number): Promise<PrismaPost[]> {
    return this.prisma.post.findMany({
      where: { categoryId },
      include: { author: true, comments: true, category: true },
    });
  }
}
