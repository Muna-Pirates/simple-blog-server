import { Injectable, Logger } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({ where: { email } });
    } catch (error) {
      this.logger.error(`Error finding user by email: ${email}`, error.stack);
      throw error;
    }
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    try {
      return await this.prisma.user.create({
        data: { ...data, password: hashedPassword },
      });
    } catch (error) {
      this.logger.error('Error creating user', error.stack);
      throw error;
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({ where: { id } });
    } catch (error) {
      this.logger.error(`Error finding user by ID: ${id}`, error.stack);
      throw error;
    }
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.logger.error(`Error updating user with ID: ${id}`, error.stack);
      throw error;
    }
  }

  async delete(id: number): Promise<User> {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      this.logger.error(`Error deleting user with ID: ${id}`, error.stack);
      throw error;
    }
  }
}
