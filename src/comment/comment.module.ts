import { Module } from '@nestjs/common';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { PostService } from 'src/post/post.service';
import { PrismaService } from 'src/common/prisma.service';

@Module({
  providers: [CommentResolver, CommentService, PostService, PrismaService],
})
export class CommentModule {}
