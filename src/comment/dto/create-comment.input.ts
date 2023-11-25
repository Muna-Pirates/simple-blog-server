import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsInt, MinLength } from 'class-validator';

@InputType()
export class CreateCommentInput {
  @Field(() => Int)
  @IsInt()
  postId: number;

  @Field()
  @IsNotEmpty()
  @MinLength(3)
  content: string;
}
