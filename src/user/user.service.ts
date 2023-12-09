import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import * as bcrypt from 'bcrypt';
import { RoleType } from 'src/role/entities/role.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  private async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, 10);
    } catch (error) {
      this.logger.error('Error hashing password', error.stack);
      throw new InternalServerErrorException('Error processing password');
    }
  }

  private async findUserByUniqueField(
    field: 'email' | 'id',
    value: string | number,
  ): Promise<User | null> {
    let whereCondition: Prisma.UserWhereUniqueInput;

    if (field === 'email') {
      whereCondition = { email: value as string };
    } else if (field === 'id') {
      whereCondition = { id: value as number };
    } else {
      throw new Error(`Invalid field: ${field}`);
    }

    return this.prisma.user.findUnique({
      where: whereCondition,
      include: { role: true },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findUserByUniqueField('email', email);
  }

  async create(userData: Prisma.UserCreateInput): Promise<User> {
    try {
      const hashedPassword = await this.hashPassword(userData.password);
      const newUser: Prisma.UserCreateInput = {
        ...userData,
        password: hashedPassword,
        role: {
          connect: userData.role
            ? { id: userData.role.connect?.id || RoleType.USER }
            : undefined,
        },
      };

      return await this.prisma.user.create({
        data: newUser,
        include: { role: true },
      });
    } catch (error) {
      this.logger.error('Error creating user', error.stack);
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async findById(id: number): Promise<User | null> {
    return this.findUserByUniqueField('id', id);
  }

  async update(id: number, updateData: Prisma.UserUpdateInput): Promise<User> {
    try {
      const updatedUser = {
        ...updateData,
        role: updateData.role?.connect
          ? { connect: { id: updateData.role.connect.id } }
          : undefined,
      };

      return await this.prisma.user.update({
        where: { id },
        data: updatedUser,
        include: { role: true },
      });
    } catch (error) {
      this.logger.error(`Error updating user with ID ${id}`, error.stack);
      throw new InternalServerErrorException(
        `Error updating user with ID ${id}`,
      );
    }
  }

  async delete(id: number): Promise<User> {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      this.logger.error(`Error deleting user with ID ${id}`, error.stack);
      throw new InternalServerErrorException(
        `Error deleting user with ID ${id}`,
      );
    }
  }

  async getRole(roleId: number): Promise<Role | null> {
    try {
      return await this.prisma.role.findUnique({
        where: { id: roleId },
      });
    } catch (error) {
      this.logger.error(`Error retrieving role with ID ${roleId}`, error.stack);
      throw new InternalServerErrorException(
        `Error retrieving role with ID ${roleId}`,
      );
    }
  }

  async getDefaultRole(): Promise<Role | null> {
    return this.getRole(RoleType.USER);
  }
}
