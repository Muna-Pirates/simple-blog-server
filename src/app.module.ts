import { Module, Global } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
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
import { PrismaModule } from './prisma/prisma.module';

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
        formatError: AppModule.formatError,
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
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService, LoggerService, CacheService],
  exports: [LoggerService, CacheService],
})
export class AppModule {
  private static formatError(error: GraphQLError): GraphQLFormattedError {
    const { message, extensions } = error;

    let formattedError: GraphQLFormattedError = {
      message: 'An error occurred',
      extensions: {
        code: 'INTERNAL_ERROR',
      },
    };

    if (extensions?.code) {
      switch (extensions.code) {
        case 'UNAUTHENTICATED':
          formattedError = {
            message: 'Unauthorized access',
            extensions: {
              code: 'UNAUTHENTICATED',
              details: 'Access is denied due to invalid credentials',
            },
          };
          break;
        case 'BAD_REQUEST':
          const hasMessage = (error: unknown): error is { message: string } => {
            return (
              typeof error === 'object' && error !== null && 'message' in error
            );
          };

          formattedError = {
            message: 'Invalid input data provided',
            extensions: {
              code: 'BAD_REQUEST',
              details: hasMessage(extensions.originalError)
                ? extensions.originalError.message
                : [],
            },
          };
          break;
        case 'INTERNAL_SERVER_ERROR':
          formattedError = {
            message: 'Internal server error',
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
            },
          };
          break;
        case 'GRAPHQL_VALIDATION_FAILED':
          formattedError = {
            message: 'GraphQL validation error',
            extensions: {
              code: 'GRAPHQL_VALIDATION_FAILED',
              details: message,
            },
          };
          break;
      }
    }

    return formattedError;
  }
}
