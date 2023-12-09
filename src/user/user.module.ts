import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../common/prisma.service';
import { RoleService } from '../role/role.service';
import { CommentService } from '../comment/comment.service';
import { PostService } from '../post/post.service';
import { ErrorService } from '../common/errors/error.service';
import { CacheService } from 'src/common/cache.service';

@Module({
  imports: [CacheModule.register()],
  providers: [
    UserResolver,
    UserService,
    AuthService,
    PrismaService,
    RoleService,
    CommentService,
    PostService,
    ErrorService,
    CacheService,
  ],
})
export class UserModule {}
