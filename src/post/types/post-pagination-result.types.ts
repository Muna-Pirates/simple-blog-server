import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Post } from './post.types';

@ObjectType()
export class PaginationInfo {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  totalItems: number;
}

@ObjectType()
export class PostPaginationResult {
  @Field(() => [Post])
  posts: Post[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}
