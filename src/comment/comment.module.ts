import { Module, forwardRef } from '@nestjs/common';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { PubSubService } from 'src/common/pubsub.service';
import { PostModule } from 'src/post/post.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [forwardRef(() => PostModule), PrismaModule],
  providers: [CommentResolver, CommentService, PubSubService],
  exports: [CommentService],
})
export class CommentModule {}
