import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service'; // Update the path if necessary

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
