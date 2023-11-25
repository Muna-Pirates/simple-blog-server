import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: {
          email,
        },
      });
    } catch (error) {
      console.error('Error finding user by email', error);
      throw error;
    }
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    try {
      return await this.prisma.user.create({
        data,
      });
    } catch (error) {
      console.error('Error creating user', error);
      throw error;
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: {
          id,
        },
      });
    } catch (error) {
      console.error('Error finding user by id', error);
      throw error;
    }
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User | null> {
    try {
      return await this.prisma.user.update({
        where: {
          id,
        },
        data,
      });
    } catch (error) {
      console.error('Error updating user', error);
      throw error;
    }
  }

  async delete(id: number): Promise<User | null> {
    try {
      return await this.prisma.user.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      console.error('Error deleting user', error);
      throw error;
    }
  }
}
