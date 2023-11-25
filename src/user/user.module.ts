import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/common/prisma.service';
import { RoleService } from 'src/role/role.service';

@Module({
  providers: [
    UserResolver,
    UserService,
    AuthService,
    PrismaService,
    RoleService,
  ],
})
export class UserModule {}
