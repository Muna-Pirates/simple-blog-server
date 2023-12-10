import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import * as bcrypt from 'bcrypt';
import { RoleType } from 'src/role/entities/role.entity';
import { CacheService } from 'src/common/cache.service';
import { PasswordService } from 'src/common/password.service';
import { RoleService } from 'src/role/role.service';
import { UserCacheService } from './user-cache.service';

enum UserField {
  Email = 'email',
  Id = 'id',
}

type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private roleService: RoleService,
    private userCacheService: UserCacheService,
  ) {}

  private async connectRole(
    roleConnectInput: Prisma.RoleCreateNestedOneWithoutUsersInput,
  ): Promise<Prisma.RoleCreateNestedOneWithoutUsersInput | undefined> {
    if (!roleConnectInput) return undefined;
    const roleId = roleConnectInput.connect?.id || RoleType.USER;
    return { connect: { id: roleId } };
  }

  private async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      this.logger.error('Error hashing password', error.stack);
      throw new InternalServerErrorException('Error processing password');
    }
  }

  private async findUserByUniqueField(
    field: UserField,
    value: string | number,
  ): Promise<UserWithoutPassword | null> {
    try {
      const cacheKey = `user:${field}:${value}`;
      const cachedUser = await this.cacheService.get<User>(cacheKey);
      if (cachedUser) {
        const { password, ...userWithoutPassword } = cachedUser;
        return userWithoutPassword;
      }

      const whereCondition: Prisma.UserWhereUniqueInput =
        field === UserField.Email
          ? { email: value as string }
          : { id: value as number };

      const user = await this.prisma.user.findUnique({
        where: whereCondition,
        include: { role: true },
      });

      if (user) {
        const { password, ...userWithoutPassword } = user;
        await this.cacheService.set(cacheKey, userWithoutPassword);
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Error finding user by ${field}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(`Failed to find user by ${field}`);
    }
  }

  async findByEmail(email: string): Promise<UserWithoutPassword | null> {
    return this.findUserByUniqueField(UserField.Email, email);
  }

  async create(userData: Prisma.UserCreateInput): Promise<UserWithoutPassword> {
    try {
      if (!userData.password) {
        throw new BadRequestException('Password is required');
      }

      const hashedPassword = await this.hashPassword(userData.password);

      const newUser: Prisma.UserCreateInput = {
        ...userData,
        password: hashedPassword,
        role: await this.connectRole(userData.role),
      };

      const createdUser = await this.prisma.user.create({
        data: newUser,
        include: { role: true },
      });

      const { password, ...userWithoutPassword } = createdUser;
      return userWithoutPassword;
    } catch (error) {
      this.logger.error('Error creating user: ' + error.message, error.stack);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findById(id: number): Promise<UserWithoutPassword | null> {
    return this.findUserByUniqueField(UserField.Id, id);
  }

  async update(
    id: number,
    updateData: Prisma.UserUpdateInput,
  ): Promise<UserWithoutPassword> {
    try {
      if (typeof updateData.password === 'string') {
        updateData.password = await this.hashPassword(updateData.password);
      }

      const updatedUser = {
        ...updateData,
        role: await this.connectRole(updateData.role),
      };

      const user = await this.prisma.user.update({
        where: { id },
        data: updatedUser,
        include: { role: true },
      });

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      this.logger.error(
        `Error updating user with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to update user with ID ${id}`,
      );
    }
  }

  async delete(id: number): Promise<UserWithoutPassword> {
    try {
      const deletedUser = await this.prisma.user.delete({ where: { id } });
      const { password, ...userWithoutPassword } = deletedUser;
      return userWithoutPassword;
    } catch (error) {
      this.logger.error(
        `Error deleting user with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to delete user with ID ${id}`,
      );
    }
  }

  async getRole(roleId: number): Promise<Role | null> {
    try {
      return await this.prisma.role.findUnique({ where: { id: roleId } });
    } catch (error) {
      this.logger.error(
        `Error retrieving role with ID ${roleId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to retrieve role with ID ${roleId}`,
      );
    }
  }

  async getDefaultRole(): Promise<Role | null> {
    return this.getRole(RoleType.USER);
  }
}
