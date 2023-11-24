import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { CreateUserInput } from './dto/create-user.input';
import { UserType } from './types/user.types';

@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  @Mutation((returns) => UserType)
  async createUser(
    @Args('createUserData') createUserData: CreateUserInput,
  ): Promise<User> {
    try {
      const user = await this.userService.createUser(createUserData);
      return user;
    } catch (error) {
      throw new Error('Error creating user: ' + error.message);
    }
  }
}
