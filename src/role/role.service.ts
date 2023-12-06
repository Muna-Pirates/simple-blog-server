import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class RoleService {
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
}
