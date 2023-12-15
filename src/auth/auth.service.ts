import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
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
  private readonly accountLockoutTime = 60 * 30; // 30 minutes

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private cacheService: CacheService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser | null> {
    const accessKey = `loginAttempts:${email}`;
    const accountLockedKey = `accountLocked:${email}`;

    if (await this.isAccountLocked(accountLockedKey)) {
      throw new Error('Account temporarily locked. Please try again later.');
    }

    const loginAttempts = await this.getLoginAttempts(accessKey);
    if (loginAttempts >= this.maxLoginAttempts) {
      await this.lockAccount(accountLockedKey);
      throw new Error('Account temporarily locked. Please try again later.');
    }

    const user = await this.findUserByEmail(email);
    if (!user) {
      await this.incrementLoginAttempts(accessKey);
      throw new BadRequestException('Login failed. Please try again.');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      await this.incrementLoginAttempts(accessKey);
      throw new BadRequestException('Login failed. Please try again.');
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

  private async isAccountLocked(key: string): Promise<boolean> {
    return (await this.cacheService.get<boolean>(key)) ?? false;
  }

  private async lockAccount(key: string): Promise<void> {
    await this.cacheService.set(key, true, this.accountLockoutTime);
  }

  generateJwtToken(user: AuthenticatedUser): string {
    const payload = { username: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }
}
