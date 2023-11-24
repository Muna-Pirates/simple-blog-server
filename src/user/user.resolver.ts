import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { CreateUserInput } from './dto/create-user.input';
import { UserType } from './types/user.types';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';

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

  @Query((returns) => UserType, { nullable: true })
  async findUser(@Args('userId') userId: number): Promise<User | null> {
    try {
      const user = await this.userService.findUser(userId);
      return user;
    } catch (error) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  @Mutation((returns) => UserType)
  async updateUser(
    @Args('updateUserData') updateUserData: UpdateUserInput,
  ): Promise<User> {
    try {
      const user = await this.userService.updateUser({
        data: updateUserData,
        userId: updateUserData.id,
      });
      return user;
    } catch (error) {
      throw new NotFoundException(
        `User with ID ${updateUserData.id} not found`,
      );
    }
  }
}
