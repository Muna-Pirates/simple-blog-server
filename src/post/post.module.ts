import { Module } from '@nestjs/common';
import { PostResolver } from './post.resolver';
import { PostService } from './post.service';
import { PrismaService } from 'src/common/prisma.service';

@Module({
  providers: [PostResolver, PostService, PrismaService],
})
export class PostModule {}
