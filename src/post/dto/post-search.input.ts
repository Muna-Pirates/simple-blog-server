import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class PostSearchInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  content?: string;

  @Field(() => Int, { nullable: true })
  authorId?: number;
}
