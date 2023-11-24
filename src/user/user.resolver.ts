import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { CreateUserInput } from './dto/create-user.input';
import { UserType } from './types/user.types';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query((returns) => UserType)
  @UseGuards(GqlAuthGuard)
  async getUser(@Args('id') id: number): Promise<User | null> {
    return this.userService.findUserById(id);
  }

  @Mutation((returns) => UserType)
  async createUser(
    @Args('createUserData') createUserData: CreateUserInput,
  ): Promise<User> {
    return this.userService.createUser(createUserData);
  }

  @Mutation((returns) => UserType)
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @Args('id') id: number,
    @Args('updateUserData') updateUserData: UpdateUserInput,
    @CurrentUser() user: User,
  ): Promise<User> {
    return this.userService.updateUser(id, updateUserData);
  }

  @Mutation((returns) => UserType)
  @UseGuards(GqlAuthGuard)
  async deleteUser(
    @Args('id') id: number,
    @CurrentUser() user: User,
  ): Promise<User> {
    return this.userService.deleteUser(id);
  }
}
