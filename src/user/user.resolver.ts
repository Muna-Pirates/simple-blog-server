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

@Resolver(() => User)
export class UserResolver {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Mutation(() => User)
  async registerUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ) {
    const userCreateInput = {
      ...createUserInput,
      role: { connect: { id: createUserInput.roleId || RoleType.USER } },
    };

    return this.userService.create(userCreateInput);
  }

  @Mutation(() => AuthPayload)
  async loginUser(@Args('credentials') credentials: LoginInput) {
    const user = await this.authService.validateUser(
      credentials.email,
      credentials.password,
    );
    if (!user) throw new NotFoundException('Invalid credentials');
    return { user, token: this.authService.generateJwtToken(user) };
  }

  @Query(() => User, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async viewUserProfile(@CurrentUser() currentUser: User) {
    return this.userService.findById(currentUser.id);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  async updateUserProfile(
    @CurrentUser() currentUser: User,
    @Args('updateData') updateData: UpdateUserInput,
  ) {
    this.authorizeUserAction(currentUser, updateData.id);
    return this.userService.update(updateData.id, updateData);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  async deleteUser(
    @CurrentUser() currentUser: User,
    @Args('id', { type: () => Int }) id: number,
  ) {
    this.authorizeUserAction(currentUser, id);
    return this.userService.delete(id);
  }

  private authorizeUserAction(currentUser: User, targetUserId: number): void {
    if (
      currentUser.id !== targetUserId &&
      currentUser.role.id !== RoleType.ADMIN
    ) {
      throw new ForbiddenException('Unauthorized access');
    }
  }
}
