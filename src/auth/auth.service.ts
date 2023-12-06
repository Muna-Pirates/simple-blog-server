import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        posts: true,
        comments: true,
      },
    });

    if (user && (await this.verifyPassword(password, user.password))) {
      return user;
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }

  generateJwtToken(user: User): string {
    const payload = { username: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }
}
