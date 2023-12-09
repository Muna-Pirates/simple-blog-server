import { Injectable, Logger } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import * as bcrypt from 'bcrypt';
import { RoleType } from 'src/role/entities/role.entity';
import { ErrorService } from 'src/common/errors/error.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private prisma: PrismaService,
    private errorService: ErrorService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
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
  }

  async findById(id: number): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
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
  }

  async delete(id: number): Promise<User> {
    return await this.prisma.user.delete({ where: { id } });
  }

  async getRole(roleId: number) {
    return await this.prisma.role.findUnique({
      where: { id: roleId },
    });
  }

  async getDefaultRole() {
    return await this.prisma.role.findUnique({
      where: { id: RoleType.USER },
    });
  }
}
