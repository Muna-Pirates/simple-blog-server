import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RoleModule } from './role/role.module';
import { PrismaService } from './common/prisma.service';
import { CategoryModule } from './category/category.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLErrorInterceptor } from './common/filters/global-exception.filter';
import { ErrorCodeService } from './common/error-code.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      subscriptions: {
        'graphql-ws': true,
      },
      formatError: (err) => {
        if (process.env.NODE_ENV === 'production') {
          return {
            message: err.message,
            code: err.extensions?.originalError,
            status: err.extensions?.status,
          };
        }

        // TODO : 전체 에러가 나오도록 (dev에서)
        return {
          message: err.message,
          code: err.extensions?.originalError,
          status: err.extensions?.status,
        };
      },
    }),
    UserModule,
    PostModule,
    CommentModule,
    AuthModule,
    RoleModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthService,
    PrismaService,
    ErrorCodeService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GraphQLErrorInterceptor,
    },
  ],
})
export class AppModule {}
