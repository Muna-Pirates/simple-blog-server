import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './types/user.types';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';
import * as bcrypt from 'bcrypt';

// registerUser(input: CreateUserInput): User
// loginUser(input: LoginInput): AuthPayload
// getUserProfile(userId: Int): User
// updateUserProfile(userId: Int, input: UpdateUserInput): User
// deleteUser(userId: Int): Boolean
@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  @Mutation(() => User)
  async registerUser(@Args('input') input: CreateUserInput): Promise<User> {
    if (input.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const existingUser = await this.userService.findByEmail(input.email);
    if (existingUser) {
      throw new Error('Email is already in use.');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await this.userService.create({
      ...input,
      password: hashedPassword,
    });

    return user;
  }
}
