import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PasswordService } from 'src/common/password.service';
import { UserCacheService } from './user-cache.service';
import { RoleService } from 'src/role/role.service';

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

  private async findUserByUniqueField(
    field: UserField,
    value: string | number,
  ): Promise<UserWithoutPassword | null> {
    const cachedUser = await this.userCacheService.getCachedUser(field, value);
    if (cachedUser) return this.omitPassword(cachedUser);

    const whereCondition: Prisma.UserWhereUniqueInput =
      field === UserField.Email
        ? { email: value as string }
        : { id: value as number };

    const user = await this.prisma.user.findUnique({
      where: whereCondition,
      include: { role: true },
    });

    if (!user)
      throw new NotFoundException(`User with ${field}: ${value} not found`);

    await this.userCacheService.setCachedUser(user);
    return this.omitPassword(user);
  }

  private omitPassword(user: User): UserWithoutPassword {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByEmail(email: string): Promise<UserWithoutPassword | null> {
    return this.findUserByUniqueField(UserField.Email, email);
  }

  async create(userData: Prisma.UserCreateInput): Promise<UserWithoutPassword> {
    if (!userData.password)
      throw new BadRequestException('Password is required');

    const hashedPassword = await this.passwordService.hashPassword(
      userData.password,
    );
    const roleConnection = await this.roleService.connectRole(userData.role);

    const newUser: Prisma.UserCreateInput = {
      ...userData,
      password: hashedPassword,
      role: roleConnection,
    };

    const createdUser = await this.prisma.user.create({
      data: newUser,
      include: { role: true },
    });

    await this.userCacheService.setCachedUser(createdUser);
    return this.omitPassword(createdUser);
  }

  async findById(id: number): Promise<UserWithoutPassword | null> {
    return this.findUserByUniqueField(UserField.Id, id);
  }

  async update(
    id: number,
    updateData: Prisma.UserUpdateInput,
  ): Promise<UserWithoutPassword> {
    if (typeof updateData.password === 'string') {
      updateData.password = await this.passwordService.hashPassword(
        updateData.password,
      );
    }

    const roleConnection = updateData.role
      ? await this.roleService.connectRole(updateData.role)
      : undefined;

    const updatedUser = {
      ...updateData,
      ...(roleConnection && { role: roleConnection }),
    };

    const user = await this.prisma.user.update({
      where: { id },
      data: updatedUser,
      include: { role: true },
    });

    if (!user) throw new NotFoundException(`User with ID: ${id} not found`);

    await this.userCacheService.setCachedUser(user);
    return this.omitPassword(user);
  }

  async delete(id: number): Promise<UserWithoutPassword> {
    const deletedUser = await this.prisma.user.delete({ where: { id } });
    return this.omitPassword(deletedUser);
  }
}
