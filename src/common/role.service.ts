import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { Prisma, Role } from '@prisma/client';
import { RoleType } from 'src/role/entities/role.entity';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(private prisma: PrismaService) {}

  async connectRole(
    roleConnectInput: Prisma.RoleCreateNestedOneWithoutUsersInput,
  ): Promise<Prisma.RoleCreateNestedOneWithoutUsersInput | undefined> {
    if (!roleConnectInput) return undefined;
    const roleId = roleConnectInput.connect?.id || RoleType.USER;
    return { connect: { id: roleId } };
  }

  async getRole(roleId: number): Promise<Role | null> {
    try {
      return await this.prisma.role.findUnique({ where: { id: roleId } });
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
