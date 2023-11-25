import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { PrismaService } from 'src/common/prisma.service';

@Module({
  providers: [RoleService, PrismaService],
})
export class RoleModule {}
