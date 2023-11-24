import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  @Mutation((returns) => User)
  async createUser(
    @Args('createUserData') createUserData: CreateUserInput,
  ): Promise<User> {
    try {
      // Validate createUserData if necessary

      const user = await this.userService.createUser(createUserData);
      return user;
    } catch (error) {
      // Handle or rethrow the error based on your error handling strategy
      throw new Error('Error creating user: ' + error.message);
    }
  }
}
