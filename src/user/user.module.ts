import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/common/prisma.service';
import { RoleService } from 'src/role/role.service';
import { CommentService } from 'src/comment/comment.service';
import { PostService } from 'src/post/post.service';
import { ErrorService } from 'src/common/errors/error.service';

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
