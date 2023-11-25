import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, Length } from 'class-validator';

@InputType()
export class CreatePostInput {
  @Field()
  @IsNotEmpty()
  @Length(3, 50) // Example length validation, adjust as needed
  title: string;

  @Field()
  @IsNotEmpty()
  @Length(10, 5000) // Example length validation, adjust as needed
  content: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];
}
