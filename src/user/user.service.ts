import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {}

  async findUserById(id: number): Promise<User | null> {}

  async updateUser(id: number, data: Prisma.UserUpdateInput): Promise<User> {}

  async deleteUser(id: number): Promise<User> {}
}
