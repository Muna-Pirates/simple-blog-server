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

  private async findPostOrThrow(postId: number): Promise<PrismaPost> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    return post;
  }

  private checkAuthorization(post: PrismaPost, userId: number, roleId: number) {
    if (post.authorId !== userId && roleId !== RoleType.ADMIN) {
      throw new UnauthorizedException('Unauthorized action on this post');
    }
  }

  async createPostWithAuthor(
    createPostInput: Prisma.PostCreateInput,
  ): Promise<PrismaPost> {
    return this.prisma.post.create({
      data: createPostInput,
      include: { author: true },
    });
  }

  async findAll(pagination: PaginationInput) {
    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;

    const [posts, totalItems] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: pageSize,
        include: { author: true },
      }),
      this.prisma.post.count(),
    ]);

    return {
      posts,
      pagination: {
        page,
        pageSize,
        totalItems,
      },
    };
  }

  async findOneById(postId: number): Promise<PrismaPost> {
    return this.findPostOrThrow(postId);
  }

  async updatePostWithAuthorization(
    postId: number,
    updateData: UpdatePostInput,
    user: { id: number; roleId: number },
  ): Promise<PrismaPost> {
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
  ): Promise<PrismaPost> {
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
        include: { author: true },
      }),
      this.prisma.post.count({ where: whereClause }),
    ]);

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
    return this.findPostOrThrow(postId).then((post) =>
      this.prisma.post.findUnique({
        where: { id: postId },
        include: { comments: true },
      }),
    );
  }

  async assignCategoryToPost(
    postId: number,
    categoryId: number,
  ): Promise<PrismaPost> {
    return this.prisma.post.update({
      where: { id: postId },
      data: { categoryId },
    });
  }

  async filterPostsByCategory(categoryId: number): Promise<PrismaPost[]> {
    return this.prisma.post.findMany({
      where: { categoryId },
      include: { author: true, comments: true },
    });
  }
}
