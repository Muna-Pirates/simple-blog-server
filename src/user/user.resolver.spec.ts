// path/filename: /src/user/user.resolver.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { AuthService } from 'src/auth/auth.service';
import { LoginInput } from 'src/auth/dto/login-input.dto';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { RoleType } from 'src/role/entities/role.entity';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let userService: UserService;
  let authService: AuthService;

  beforeEach(async () => {
    // Mock UserService and AuthService
    const userServiceMock = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const authServiceMock = {
      validateUser: jest.fn(),
      generateJwtToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        { provide: UserService, useValue: userServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
