import { Module, Global } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { GraphQLError } from 'graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { CategoryModule } from './category/category.module';
import { LoggerService } from './common/logger.service';
import { EnhancedErrorFormatter } from './common/graphql-error-formatter';
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { CacheService } from './common/cache.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        subscriptions: { 'graphql-ws': true },
        formatError: (error: GraphQLError) => {
          const loggerService = new LoggerService();
          return new EnhancedErrorFormatter(loggerService).formatGraphQLError(
            error,
          );
        },
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      useFactory: async (
        configService: ConfigService,
      ): Promise<CacheModuleOptions> => ({
        store: configService.get<string>('CACHE_STORE'),
        ttl: parseInt(configService.get<string>('CACHE_TTL'), 10),
        max: parseInt(configService.get<string>('CACHE_MAX'), 10),
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
    UserModule,
    PostModule,
    CommentModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService, LoggerService, CacheService],
  exports: [LoggerService, CacheService],
})
export class AppModule {}
