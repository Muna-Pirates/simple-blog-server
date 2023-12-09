import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PostResolver } from './post.resolver';
import { PostService } from './post.service';
import { PrismaService } from '../common/prisma.service';
import { UserService } from '../user/user.service';
import { CommentService } from '../comment/comment.service';
import { CategoryService } from '../category/category.service';
import { ErrorService } from '../common/errors/error.service';
import { CacheService } from 'src/common/cache.service';

@Module({
  imports: [CacheModule.register()],
  providers: [
    PostResolver,
    PostService,
    PrismaService,
    UserService,
    CommentService,
    CategoryService,
    ErrorService,
    CacheService,
  ],
})
export class PostModule {}
