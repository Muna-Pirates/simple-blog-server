import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../common/prisma.service';
import { RoleService } from '../role/role.service';
import { CommentService } from '../comment/comment.service';
import { PostService } from '../post/post.service';
import { ErrorService } from '../common/errors/error.service';

@Module({
  providers: [
    UserResolver,
    UserService,
    AuthService,
    PrismaService,
    RoleService,
    CommentService,
    PostService,
    ErrorService,
  ],
})
export class UserModule {}
