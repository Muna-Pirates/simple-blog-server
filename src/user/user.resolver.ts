import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './types/user.types';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';
import { AuthPayload } from 'src/auth/dto/auth-payload.dto';
import { LoginInput } from 'src/auth/dto/login-input.dto';
import { Int, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/auth.guard';
import { GqlRolesGuard } from 'src/auth/role.guard';
import { RoleType } from 'src/role/entities/role.entity';

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
            id: roleId || RoleType.USER,
          },
        },
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Mutation(() => AuthPayload)
  async loginUser(
    @Args('credentials') credentials: LoginInput,
  ): Promise<AuthPayload> {
    const user = await this.authService.validateUser(
      credentials.email,
      credentials.password,
    );
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const token = this.authService.generateJwtToken(user);
    return { user, token };
  }

  @Query((returns) => User, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async viewUserProfile(
    @CurrentUser() currentUser: User,
  ): Promise<User | null> {
    const user = await this.userService.findById(currentUser.id);

    if (!user) {
      throw new Error(`User with ID ${user.id} does not exist`);
    }

    return user;
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  async updateUserProfile(
    @CurrentUser() currentUser: User,
    @Args('updateData') updateData: UpdateUserInput,
  ): Promise<User> {
    const user = await this.userService.findById(currentUser.id);

    if (!user) {
      throw new Error(`User with ID ${user.id} does not exist`);
    }

    if (user.id !== updateData.id && user.roleId !== RoleType.ADMIN) {
      throw new Error('Unauthorized access');
    }

    return this.userService.update(updateData.id, updateData);
  }
}
