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

type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly saltRounds = 12;

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
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
    field: 'email' | 'id',
    value: string | number,
  ): Promise<UserWithoutPassword | null> {
    try {
      const cacheKey = `user:${field}:${value}`;
      const cachedUser = await this.cacheService.get<User>(cacheKey);
      if (cachedUser) {
        const { password, ...userWithoutPassword } = cachedUser;
        return userWithoutPassword;
      }

      let whereCondition: Prisma.UserWhereUniqueInput;
      if (field === 'email') {
        whereCondition = { email: value as string };
      } else {
        whereCondition = { id: value as number };
      }

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
        `Error finding user by ${field}: ` + error.message,
        error.stack,
      );
      throw new InternalServerErrorException(`Failed to find user by ${field}`);
    }
  }

  async findByEmail(email: string): Promise<UserWithoutPassword | null> {
    return this.findUserByUniqueField('email', email);
  }

  async create(userData: Prisma.UserCreateInput): Promise<User> {
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

      return await this.prisma.user.create({
        data: newUser,
        include: { role: true },
      });
    } catch (error) {
      this.logger.error('Error creating user: ' + error.message, error.stack);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findById(id: number): Promise<UserWithoutPassword | null> {
    try {
      return await this.findUserByUniqueField('id', id);
    } catch (error) {
      this.logger.error(
        `Error finding user with ID ${id}: ` + error.message,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to find user with ID ${id}`,
      );
    }
  }

  async update(id: number, updateData: Prisma.UserUpdateInput): Promise<User> {
    try {
      const updatedUser = {
        ...updateData,
        role: await this.connectRole(updateData.role),
      };

      return await this.prisma.user.update({
        where: { id },
        data: updatedUser,
        include: { role: true },
      });
    } catch (error) {
      this.logger.error(
        `Error updating user with ID ${id}: ` + error.message,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to update user with ID ${id}`,
      );
    }
  }

  async delete(id: number): Promise<User> {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      this.logger.error(
        `Error deleting user with ID ${id}: ` + error.message,
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
        `Error retrieving role with ID ${roleId}: ` + error.message,
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
