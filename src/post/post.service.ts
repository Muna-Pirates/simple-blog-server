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
import { CacheService } from 'src/common/cache.service';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  private async findEntityOrThrow<T extends PrismaPost | User>(
    entity: 'post' | 'user',
    where: Prisma.PostWhereUniqueInput | Prisma.UserWhereUniqueInput,
    errorMessage: string,
  ): Promise<T> {
    let result;
    if (entity === 'post') {
      result = await this.prisma.post.findUnique({
        where: where as Prisma.PostWhereUniqueInput,
      });
    } else if (entity === 'user') {
      result = await this.prisma.user.findUnique({
        where: where as Prisma.UserWhereUniqueInput,
      });
    }
    if (!result) throw new NotFoundException(errorMessage);
    return result as T;
  }

  private async checkAuthorization(
    post: PrismaPost,
    userId: number,
    roleId: number,
  ): Promise<void> {
    if (post.authorId !== userId && roleId !== RoleType.ADMIN) {
      throw new UnauthorizedException('Unauthorized action on this post');
    }
  }

  async createPost(
    createPostInput: Prisma.PostCreateInput,
  ): Promise<PrismaPost> {
    const newPost = await this.prisma.post.create({
      data: createPostInput,
      include: { author: true },
    });

    await this.cacheService.del('posts_page_*');
    return newPost;
  }

  private getPaginationDetails(pagination: PaginationInput) {
    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;
    return { skip, take: pageSize };
  }

  async findAll(pagination: PaginationInput) {
    const cacheKey = `posts_page_${pagination.page}`;
    const cachedPosts = await this.cacheService.get<{
      posts: PrismaPost[];
      pagination: PaginationInput;
    }>(cacheKey);
    if (cachedPosts) return cachedPosts;

    const paginationDetails = this.getPaginationDetails(pagination);
    const result = {
      posts: await this.prisma.post.findMany({
        ...paginationDetails,
        include: { author: true, comments: true, category: true },
      }),
      pagination: {
        ...pagination,
        totalItems: await this.prisma.post.count(),
      },
    };

    await this.cacheService.set(cacheKey, result, 60); // caching for 1 minute
    return result;
  }

  async findOneById(postId: number): Promise<PrismaPost> {
    const cacheKey = `post_${postId}`;
    const cachedPost = await this.cacheService.get<PrismaPost>(cacheKey);
    if (cachedPost) return cachedPost;

    const post = await this.findEntityOrThrow<PrismaPost>(
      'post',
      { id: postId },
      `Post with ID ${postId} not found.`,
    );

    await this.cacheService.set(cacheKey, post, 120); // caching for 2 minutes
    return post;
  }

  async updatePost(
    postId: number,
    updateData: UpdatePostInput,
    user: { id: number; roleId: number },
  ): Promise<PrismaPost> {
    const post = await this.findOneById(postId);
    await this.checkAuthorization(post, user.id, user.roleId);

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: { author: true, comments: true, category: true },
    });

    await this.cacheService.del(`post_${postId}`);
    await this.cacheService.del('posts_page_*');
    return updatedPost;
  }

  async deletePost(
    postId: number,
    user: { id: number; roleId: number },
  ): Promise<PrismaPost> {
    const post = await this.findOneById(postId);
    await this.checkAuthorization(post, user.id, user.roleId);

    const deletedPost = await this.prisma.post.delete({
      where: { id: postId },
      include: { author: true, comments: true, category: true },
    });

    await this.cacheService.del(`post_${postId}`);
    await this.cacheService.del('posts_page_*');
    return deletedPost;
  }

  async searchPosts(criteria: PostSearchInput, pagination: PaginationInput) {
    const cacheKey = `search_${JSON.stringify(criteria)}_page_${
      pagination.page
    }`;
    const cachedSearch = await this.cacheService.get<{
      posts: PrismaPost[];
      pagination: PaginationInput;
    }>(cacheKey);
    if (cachedSearch) return cachedSearch;

    const paginationDetails = this.getPaginationDetails(pagination);
    const whereClause: Prisma.PostWhereInput = {
      title: criteria.title ? { contains: criteria.title } : undefined,
      content: criteria.content ? { contains: criteria.content } : undefined,
      authorId: criteria.authorId || undefined,
    };

    const result = {
      posts: await this.prisma.post.findMany({
        where: whereClause,
        ...paginationDetails,
        include: { author: true, comments: true, category: true },
      }),
      pagination: {
        ...pagination,
        totalItems: await this.prisma.post.count({ where: whereClause }),
      },
    };

    await this.cacheService.set(cacheKey, result, 60); // caching for 1 minute
    return result;
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
    const user = await this.findEntityOrThrow<User>(
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
