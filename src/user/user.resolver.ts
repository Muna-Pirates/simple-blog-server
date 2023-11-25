import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './types/user.types';
import { AuthService } from 'src/auth/auth.service';
import { AuthPayload } from 'src/auth/dto/auth-payload.dto';
import { LoginInput } from 'src/auth/dto/login-input.dto';
import { Int, Query } from '@nestjs/graphql';
import {
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
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
    try {
      return await this.userService.create({
        email,
        password,
        name,
        role: { connect: { id: roleId || RoleType.USER } },
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
      throw new NotFoundException('Invalid credentials');
    }

    const token = this.authService.generateJwtToken(user);
    return { user, token };
  }

  @Query(() => User, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async viewUserProfile(
    @CurrentUser() currentUser: User,
  ): Promise<User | null> {
    return this.ensureUserExists(currentUser.id);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  async updateUserProfile(
    @CurrentUser() currentUser: User,
    @Args('updateData') updateData: UpdateUserInput,
  ): Promise<User> {
    const user = await this.ensureUserExists(currentUser.id);
    this.authorizeUserAction(user.id, updateData.id, user.roleId);

    return this.userService.update(updateData.id, updateData);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  async deleteUser(
    @CurrentUser() currentUser: User,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<User> {
    const user = await this.ensureUserExists(currentUser.id);
    this.authorizeUserAction(user.id, id, user.roleId);

    return this.userService.delete(id);
  }

  private async ensureUserExists(userId: number): Promise<User> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    return user;
  }

  private authorizeUserAction(
    currentUserId: number,
    targetUserId: number,
    currentRole: number,
  ): void {
    if (currentUserId !== targetUserId && currentRole !== RoleType.ADMIN) {
      throw new ForbiddenException('Unauthorized access');
    }
  }
}
