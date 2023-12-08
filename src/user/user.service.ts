import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
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
        include: { role: true },
      });
    } catch (error) {
      this.logger.error(`Failed to find user by email: ${error.message}`);
      throw new HttpException(
        'Error finding user by email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
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
      this.logger.error(`Failed to create user: ${error.message}`);

      if (error.code === 'P2002') {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      }

      throw new HttpException(
        'Error creating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
        include: { role: true },
      });
    } catch (error) {
      this.logger.error(`Failed to find user by ID: ${error.message}`);
      throw new HttpException(
        'Error finding user by ID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
      this.logger.error(`Failed to update user: ${error.message}`);
      throw new HttpException(
        'Error updating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: number): Promise<User> {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      this.logger.error(`Failed to delete user: ${error.message}`);
      throw new HttpException(
        'Error deleting user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRole(roleId: number) {
    try {
      return await this.prisma.role.findUnique({
        where: { id: roleId },
      });
    } catch (error) {
      this.logger.error(`Failed to get role: ${error.message}`);
      throw new HttpException(
        'Error retrieving role',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getDefaultRole() {
    try {
      return await this.prisma.role.findUnique({
        where: { id: RoleType.USER },
      });
    } catch (error) {
      this.logger.error(`Failed to get default role: ${error.message}`);
      throw new HttpException(
        'Error retrieving default role',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
