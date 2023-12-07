import { Module } from '@nestjs/common';
import { PostResolver } from './post.resolver';
import { PostService } from './post.service';
import { PrismaService } from 'src/common/prisma.service';
import { UserService } from 'src/user/user.service';
import { CommentService } from 'src/comment/comment.service';
import { CategoryService } from 'src/category/category.service';

@Module({
  providers: [
    PostResolver,
    PostService,
    PrismaService,
    UserService,
    CommentService,
    CategoryService,
  ],
})
export class PostModule {}
