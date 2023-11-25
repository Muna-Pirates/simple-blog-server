import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, Length } from 'class-validator';

@InputType()
export class CreatePostInput {
  @Field()
  @IsNotEmpty()
  @Length(3, 50)
  title: string;

  @Field()
  @IsNotEmpty()
  @Length(10, 5000)
  content: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];
}
