// /path/to/user.graphql.ts (or user.types.ts)

import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field((type) => ID)
  id: number;

  @Field()
  username: string;

  @Field()
  email: string;
}
