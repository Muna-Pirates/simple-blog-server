import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import * as bcrypt from 'bcrypt';
import { RoleType } from 'src/role/entities/role.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
        include: {
          role: true,
        },
      });
    } catch (error) {
      this.logger.error(`Error finding user by email: ${email}`, error.stack);
      throw new InternalServerErrorException('Error finding user by email');
    }
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    try {
      const userData: Prisma.UserCreateInput = {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: {
          connect: data.role
            ? { id: data.role.connect?.id || RoleType.USER }
            : undefined,
        },
      };

      return await this.prisma.user.create({
        data: userData,
        include: { role: true },
      });
    } catch (error) {
      this.logger.error('Error creating user', error.message);
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Email already exists. Please use another email.',
        );
      }
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: { role: true },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }
      return user;
    } catch (error) {
      this.logger.error(`Error finding user by ID: ${id}`, error.stack);
      throw new InternalServerErrorException(`Error finding user by ID`);
    }
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...data,
          role: data.role?.connect
            ? { connect: { id: data.role.connect.id } }
            : undefined,
        },
        include: { role: true },
      });
    } catch (error) {
      this.logger.error(`Error updating user with ID: ${id}`, error.stack);
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Email already exists. Please use another email.',
        );
      }
      throw new InternalServerErrorException(`Error updating user`);
    }
  }

  async delete(id: number): Promise<User> {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      this.logger.error(`Error deleting user with ID: ${id}`, error.stack);
      throw new InternalServerErrorException(`Error deleting user`);
    }
  }

  async getRole(roleId: number) {
    try {
      const roleRecord = await this.prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!roleRecord) {
        throw new NotFoundException(`Role with ID ${roleId} not found.`);
      }

      return roleRecord;
    } catch (error) {
      this.logger.error(
        `Error retrieving role with ID: ${roleId}`,
        error.stack,
      );
      throw new InternalServerErrorException(`Error retrieving role`);
    }
  }

  async getDefaultRole() {
    try {
      const roleRecord = await this.prisma.role.findUnique({
        where: { id: RoleType.USER },
      });

      if (!roleRecord) {
        throw new NotFoundException('Default user role not found.');
      }

      return roleRecord;
    } catch (error) {
      this.logger.error('Error retrieving default user role', error.stack);
      throw new InternalServerErrorException(
        'Error retrieving default user role',
      );
    }
  }
}
