import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, MaxLength } from 'class-validator';

@InputType()
export class CreateCategoryInput {
  @Field()
  @IsNotEmpty({ message: 'Category name must not be empty.' })
  @MaxLength(50, { message: 'Category name must not exceed 50 characters.' })
  name: string;
}
