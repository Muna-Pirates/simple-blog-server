import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Category } from 'src/category/types/category.types';
import { User } from 'src/user/types/user.types';
import { Comment } from 'src/comment/types/comment.types';

@ObjectType()
export class Post {
  @Field(() => ID)
  id: number;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field(() => Int)
  authorId: number;

  @Field(() => User)
  author: User;

  @Field(() => [Comment], { nullable: 'itemsAndList' }) // Lazy loading for relations
  comments: Comment[];

  @Field(() => Int, { nullable: true })
  categoryId?: number;

  @Field(() => Category, { nullable: true })
  categories?: Category;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
