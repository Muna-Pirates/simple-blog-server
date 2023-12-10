import { Module, forwardRef } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { RoleService } from '../role/role.service';
import { PasswordService } from 'src/common/password.service';
import { UserCacheService } from './user-cache.service';
import { AuthModule } from 'src/auth/auth.module';
import { CommentModule } from 'src/comment/comment.module';

@Module({
  imports: [AuthModule, forwardRef(() => CommentModule)],
  providers: [
    UserResolver,
    UserService,
    RoleService,
    PasswordService,
    UserCacheService,
  ],
  exports: [UserService],
})
export class UserModule {}
