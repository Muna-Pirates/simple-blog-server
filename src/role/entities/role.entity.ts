import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from 'src/user/types/user.types';

@ObjectType()
export class Role {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field(() => [User])
  users: User[];
}

export enum RoleType {
  ADMIN = 1,
  USER = 2,
}
