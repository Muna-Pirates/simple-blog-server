import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {}

  async findUser(userId: number): Promise<User | null> {}

  async updateUser(params: {
    userId: number;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {}

  async deleteUser(userId: number): Promise<User> {}
}
