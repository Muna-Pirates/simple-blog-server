// path/filename: src/auth/auth.service.ts

import { Injectable, Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/common/prisma.service';
import * as bcrypt from 'bcrypt';
import { CacheService } from 'src/common/cache.service';

type AuthenticatedUser = {
  id: number;
  email: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly maxLoginAttempts = 5;
  private readonly loginAttemptTTL = 60 * 5; // 5 minutes

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(CacheService) private cacheService: CacheService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser | null> {
    const accessKey = `loginAttempts:${email}`;
    const loginAttempts = await this.getLoginAttempts(accessKey);

    if (loginAttempts > this.maxLoginAttempts) {
      throw new Error('Too many login attempts. Please try again later.');
    }

    const user = await this.findUserByEmail(email);
    if (!user) {
      await this.incrementLoginAttempts(accessKey);
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.incrementLoginAttempts(accessKey);
      throw new Error('Invalid password');
    }

    await this.resetLoginAttempts(accessKey);
    return { id: user.id, email: user.email };
  }

  private async getLoginAttempts(key: string): Promise<number> {
    return (await this.cacheService.get<number>(key)) || 0;
  }

  private async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true },
    });
  }

  private async incrementLoginAttempts(key: string): Promise<void> {
    const currentAttempts = await this.getLoginAttempts(key);
    await this.cacheService.set(key, currentAttempts + 1, this.loginAttemptTTL);
  }

  private async resetLoginAttempts(key: string): Promise<void> {
    await this.cacheService.del(key);
  }

  generateJwtToken(user: AuthenticatedUser): string {
    const payload = { username: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }
}
