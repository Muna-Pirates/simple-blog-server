import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'src/user/types/user.types';

@ObjectType()
export class AuthPayload {
  @Field(() => User)
  user: User;

  @Field()
  token: string;
}
