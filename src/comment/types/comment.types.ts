import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Post } from 'src/post/types/post.types';
import { User } from 'src/user/types/user.types';

@ObjectType()
export class Comment {
  @Field(() => Int)
  id: number;

  @Field()
  content: string;

  @Field(() => User)
  author: User;

  @Field(() => Int)
  authorId: number;

  @Field(() => Post)
  post: Post;

  @Field(() => Int)
  postId: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
