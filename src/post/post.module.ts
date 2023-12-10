import { Module, forwardRef } from '@nestjs/common';
import { PostResolver } from './post.resolver';
import { PostService } from './post.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [PostResolver, PostService],
  exports: [PostService],
})
export class PostModule {}
