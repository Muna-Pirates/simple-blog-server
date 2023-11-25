import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Post } from 'src/post/types/post.types';

@ObjectType()
export class Category {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => [Post], { nullable: 'itemsAndList' })
  posts: Post[];
}
