import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from 'src/common/prisma.service';

@Module({
  imports: [ConfigModule],
  providers: [AuthService, JwtStrategy, PrismaService],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
