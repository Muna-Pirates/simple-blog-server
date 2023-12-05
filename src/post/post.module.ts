import { Module } from '@nestjs/common';
import { PostResolver } from './post.resolver';
import { PostService } from './post.service';
import { PrismaService } from 'src/common/prisma.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [PostResolver, PostService, PrismaService, UserService],
})
export class PostModule {}
