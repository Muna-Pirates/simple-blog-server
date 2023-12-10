import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import { RoleType } from './entities/role.entity';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(private prismaService: PrismaService) {}

  async findRoleById(roleId: number): Promise<Role | null> {
    try {
      return await this.prismaService.role.findUnique({
        where: { id: roleId },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to find role: ${error.message}`);
    }
  }

  async getUserRole(userId: number): Promise<Role> {
    return this.prismaService.user.findUnique({ where: { id: userId } }).role();
  }

  async connectRole(
    roleConnectInput: Prisma.RoleCreateNestedOneWithoutUsersInput,
  ): Promise<Prisma.RoleCreateNestedOneWithoutUsersInput | undefined> {
    if (!roleConnectInput) return undefined;
    const roleId = roleConnectInput.connect?.id || RoleType.USER;
    return { connect: { id: roleId } };
  }

  async getRole(roleId: number): Promise<Role | null> {
    try {
      return await this.prismaService.role.findUnique({
        where: { id: roleId },
      });
    } catch (error) {
      this.logger.error(
        `Error retrieving role with ID ${roleId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to retrieve role with ID ${roleId}`,
      );
    }
  }

  async getDefaultRole(): Promise<Role | null> {
    return this.getRole(RoleType.USER);
  }
}
