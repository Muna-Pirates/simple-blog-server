import { Module } from '@nestjs/common';
import { PostResolver } from './post.resolver';
import { PostService } from './post.service';
import { PrismaService } from '../common/prisma.service';
import { UserService } from '../user/user.service';
import { CommentService } from '../comment/comment.service';
import { CategoryService } from '../category/category.service';
import { ErrorService } from '../common/errors/error.service';

@Module({
  providers: [
    PostResolver,
    PostService,
    PrismaService,
    UserService,
    CommentService,
    CategoryService,
    ErrorService,
  ],
})
export class PostModule {}
