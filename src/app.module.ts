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

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      subscriptions: {
        'graphql-ws': true,
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
  providers: [AppService, AuthService, PrismaService],
})
export class AppModule {}
