import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async set<T>(key: string, value: T, ttl = 0): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.log(`Cache set for key: ${key}`);
    } catch (error) {
      this.logger.error(`Error setting cache for key: ${key}`, error.stack);
      throw new Error(`Error setting cache for key: ${key}`);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value) {
        this.logger.log(`Cache hit for key: ${key}`);
      } else {
        this.logger.warn(`Cache miss for key: ${key}`);
      }
      return value;
    } catch (error) {
      this.logger.error(`Error getting cache for key: ${key}`, error.stack);
      throw new Error(`Error getting cache for key: ${key}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.log(`Cache deleted for key: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting cache for key: ${key}`, error.stack);
      throw new Error(`Error deleting cache for key: ${key}`);
    }
  }
}
