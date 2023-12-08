import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import * as bcrypt from 'bcrypt';
import { RoleType } from 'src/role/entities/role.entity';
import { ErrorService } from 'src/common/errors/error.service';
import { ErrorCode } from 'src/common/errors/error-codes';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private prisma: PrismaService,
    private errorService: ErrorService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
        include: { role: true },
      });
    } catch (error) {
      this.handleError(error);
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
      this.handleError(error);
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
        include: { role: true },
      });
    } catch (error) {
      this.handleError(error);
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
      this.handleError(error);
    }
  }

  async delete(id: number): Promise<User> {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      this.handleError(error);
    }
  }

  async getRole(roleId: number) {
    try {
      return await this.prisma.role.findUnique({
        where: { id: roleId },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async getDefaultRole() {
    try {
      return await this.prisma.role.findUnique({
        where: { id: RoleType.USER },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    const errorCode = this.errorService.getErrorCode(error);

    switch (errorCode) {
      case ErrorCode.NOT_FOUND:
        throw new NotFoundException();
      case ErrorCode.VALIDATION_ERROR:
        throw new BadRequestException();
      case ErrorCode.AUTHORIZATION_ERROR:
        throw new UnauthorizedException();
      case ErrorCode.INTERNAL_SERVER_ERROR:
      default:
        this.logger.error(error.message, error.stack);
        throw new InternalServerErrorException();
    }
  }
}
