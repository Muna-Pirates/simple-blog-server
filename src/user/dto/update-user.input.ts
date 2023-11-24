import { Field, PartialType } from '@nestjs/graphql';
import { CreateUserInput } from './create-user.input';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field()
  @IsNotEmpty()
  @IsString()
  id: number;
}
