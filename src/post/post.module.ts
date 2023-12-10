import { Module, forwardRef } from '@nestjs/common';
import { PostResolver } from './post.resolver';
import { PostService } from './post.service';
import { UserModule } from 'src/user/user.module';
import { CommentModule } from 'src/comment/comment.module';
import { CategoryModule } from 'src/category/category.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => CommentModule),
    forwardRef(() => CategoryModule),
    PrismaModule,
  ],
  providers: [PostResolver, PostService],
  exports: [PostService],
})
export class PostModule {}
