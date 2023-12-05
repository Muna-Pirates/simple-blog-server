import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Post } from 'src/post/types/post.types';
import { Role } from 'src/role/entities/role.entity';

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Role)
  role: Role;

  @Field(() => [Post])
  posts: Post[];

  @Field(() => [Comment])
  comments: Comment[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
