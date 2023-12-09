// path/filename: src/posts/post.service.ts
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { Post as PrismaPost, Prisma } from '@prisma/client';
import { UpdatePostInput } from './dto/update-post.input';
import { PostSearchInput } from './dto/post-search.input';
import { RoleType } from 'src/role/entities/role.entity';
import { PaginationInput } from './dto/pagination.input';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  // Reusable method for fetching posts with includes
  private async fetchPostWithIncludes(
    postId: number,
    includeExtras = true,
  ): Promise<PrismaPost> {
    const includes = includeExtras
      ? { author: true, comments: true, category: true }
      : {};
    return await this.prisma.post.findUnique({
      where: { id: postId },
      include: includes,
    });
  }

  // Enhanced error handling with NotFoundException
  private async findPostOrThrow(postId: number): Promise<PrismaPost> {
    const post = await this.fetchPostWithIncludes(postId);
    if (!post) throw new NotFoundException(`Post with ID ${postId} not found.`);
    return post;
  }

  // Improved authorization checks with UnauthorizedException
  private checkAuthorization(
    post: PrismaPost,
    userId: number,
    roleId: number,
  ): void {
    if (post.authorId !== userId && roleId !== RoleType.ADMIN) {
      throw new UnauthorizedException('Unauthorized action on this post');
    }
  }

  // Simplified database operation for creating a post
  async createPost(
    createPostInput: Prisma.PostCreateInput,
  ): Promise<PrismaPost> {
    return this.prisma.post.create({
      data: createPostInput,
      include: { author: true },
    });
  }

  // Pagination logic abstracted for reusability
  private getPaginationDetails(pagination: PaginationInput) {
    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;
    return { skip, pageSize };
  }

  // Optimized findAll method with reusable pagination logic
  async findAll(pagination: PaginationInput) {
    const { skip, pageSize } = this.getPaginationDetails(pagination);
    const [posts, totalItems] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: pageSize,
        include: { author: true, comments: true, category: true },
      }),
      this.prisma.post.count(),
    ]);

    return { posts, pagination: { ...pagination, totalItems } };
  }

  // Simplified method for finding a single post by ID
  async findOneById(postId: number): Promise<PrismaPost> {
    return this.findPostOrThrow(postId);
  }

  // Updated updatePost method with enhanced authorization and error handling
  async updatePost(
    postId: number,
    updateData: UpdatePostInput,
    user: { id: number; roleId: number },
  ): Promise<PrismaPost> {
    const post = await this.findPostOrThrow(postId);
    this.checkAuthorization(post, user.id, user.roleId);
    return this.prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: { author: true, comments: true, category: true },
    });
  }

  // Updated deletePost method with improved authorization checks
  async deletePost(
    postId: number,
    user: { id: number; roleId: number },
  ): Promise<PrismaPost> {
    const post = await this.findPostOrThrow(postId);
    this.checkAuthorization(post, user.id, user.roleId);
    return this.prisma.post.delete({
      where: { id: postId },
      include: { author: true, comments: true, category: true },
    });
  }

  // Refined searchPosts method with reusable pagination and simplified logic
  async searchPosts(criteria: PostSearchInput, pagination: PaginationInput) {
    const { title, content, authorId } = criteria;
    const { skip, pageSize } = this.getPaginationDetails(pagination);

    const whereClause: Prisma.PostWhereInput = {
      title: title ? { contains: title } : undefined,
      content: content ? { contains: content } : undefined,
      authorId: authorId || undefined,
    };

    const [posts, totalItems] = await Promise.all([
      this.prisma.post.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        include: { author: true, comments: true, category: true },
      }),
      this.prisma.post.count({ where: whereClause }),
    ]);

    return { posts, pagination: { ...pagination, totalItems } };
  }

  // Additional methods for category assignment and filtering
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

  async filterPostsByCategory(categoryId: number): Promise<PrismaPost[]> {
    return this.prisma.post.findMany({
      where: { categoryId },
      include: { author: true, comments: true, category: true },
    });
  }

  // Utilizing Prisma relations for fetching user posts
  async getUserPosts(userId: number): Promise<PrismaPost[]> {
    return this.prisma.user.findUnique({ where: { id: userId } }).posts();
  }

  // Method for getting posts by category ID
  async getPostsByCategory(categoryId: number): Promise<PrismaPost[]> {
    return this.prisma.post.findMany({
      where: { categoryId },
      include: { author: true, comments: true, category: true },
    });
  }

  // Simplified method for getting a single post
  async getPost(postId: number): Promise<PrismaPost | null> {
    return this.prisma.post.findUnique({ where: { id: postId } });
  }
}
