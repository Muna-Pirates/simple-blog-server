import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Post } from 'src/post/types/post.types';

@ObjectType()
export class Category {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field(() => [Post], { nullable: true })
  posts?: Post[];
}
