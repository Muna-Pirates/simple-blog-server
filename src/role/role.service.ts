import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class RoleService {
  constructor(private prismService: PrismaService) {}

  async findRoleById(roleId: number): Promise<Role | null> {
    try {
      return await this.prismService.role.findUnique({
        where: { id: roleId },
      });
    } catch (error) {
      throw new Error(`Failed to find role: ${error.message}`);
    }
  }
}
