import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @Field()
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @Field({ nullable: true })
  @IsString({ message: 'Name must be a string', each: true })
  @IsOptional()
  name?: string;

  @Field(() => Int, { nullable: true })
  roleId?: number;
}
