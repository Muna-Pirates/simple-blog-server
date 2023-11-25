import { Field, ObjectType, Int } from '@nestjs/graphql';
import { User } from 'src/user/types/user.types';

@ObjectType()
export class Role {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => [User], { nullable: 'itemsAndList' })
  users: User[];
}

export enum RoleType {
  ADMIN = 1,
  USER = 2,
}
