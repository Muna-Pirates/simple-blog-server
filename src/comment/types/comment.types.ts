import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Post } from 'src/post/types/post.types';
import { User } from 'src/user/types/user.types';

@ObjectType()
export class Comment {
  @Field(() => ID)
  id: number;
  @Field()
  content: string;

  @Field(() => Int)
  authorId: number;

  @Field(() => Int)
  postId: number;

  @Field(() => User)
  author: User;

  @Field(() => Post)
  post: Post;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
