import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserInput } from './dto/create-user.input';
import { RoleType } from 'src/role/entities/role.entity';
import { User } from '@prisma/client';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let userService: jest.Mocked<UserService>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
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
    userService = module.get<UserService>(
      UserService,
    ) as jest.Mocked<UserService>;
    authService = module.get<AuthService>(
      AuthService,
    ) as jest.Mocked<AuthService>;
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('registerUser', () => {
    it('should successfully register a user', async () => {
      const userInput: CreateUserInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
        roleId: RoleType.USER,
      };

      const user: User = {
        ...userInput,
        id: 1,
        name: 'John Doe',
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userService.create.mockResolvedValue(user);

      expect(await resolver.registerUser(userInput)).toEqual(user);
      expect(userService.create).toHaveBeenCalledWith(userInput);
    });
  });
});
