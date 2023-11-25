import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './types/user.types';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';
import { AuthPayload } from 'src/auth/dto/auth-payload.dto';
import { LoginInput } from 'src/auth/dto/login-input.dto';

// registerUser(input: CreateUserInput): User
// loginUser(input: LoginInput): AuthPayload
// getUserProfile(userId: Int): User
// updateUserProfile(userId: Int, input: UpdateUserInput): User
// deleteUser(userId: Int): Boolean
@Resolver()
export class UserResolver {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Mutation(() => User)
  async registerUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    const { email, password, name, roleId } = createUserInput;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      return await this.userService.create({
        email,
        password: hashedPassword,
        name,
        role: {
          connect: {
            id: roleId || 2,
          },
        },
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
