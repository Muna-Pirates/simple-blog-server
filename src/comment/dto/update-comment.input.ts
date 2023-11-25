import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateCommentInput {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  content: string;
}
