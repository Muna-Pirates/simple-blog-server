import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { CacheService } from 'src/common/cache.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserCacheService {
  private readonly logger = new Logger(UserCacheService.name);

  constructor(private cacheService: CacheService) {}

  async getCachedUser(
    field: string,
    value: string | number,
  ): Promise<User | null> {
    try {
      const cacheKey = `user:${field}:${value}`;
      return await this.cacheService.get<User>(cacheKey);
    } catch (error) {
      this.logger.error(
        `Error retrieving cached user by ${field}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to retrieve cached user by ${field}`,
      );
    }
  }

  async setCachedUser(user: User): Promise<void> {
    try {
      const { id, email } = user;
      await this.cacheService.set(`user:email:${email}`, user);
      await this.cacheService.set(`user:id:${id}`, user);
    } catch (error) {
      this.logger.error('Error setting user cache', error.stack);
      throw new InternalServerErrorException('Error setting user cache');
    }
  }
}
