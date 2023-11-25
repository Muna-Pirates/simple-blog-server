import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Category } from 'src/category/types/category.types';
import { User } from 'src/user/types/user.types';
import { Comment } from 'src/comment/types/comment.types';

@ObjectType()
export class Post {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field(() => User)
  author: User;

  @Field(() => Int)
  authorId: number;

  @Field(() => [Comment], { nullable: 'itemsAndList' })
  comments: Comment[];

  @Field(() => Category, { nullable: true })
  category?: Category;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
