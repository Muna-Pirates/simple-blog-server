// path/filename: /src/user/user.resolver.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserInput, UpdateUserInput } from './dto';
import { User, RoleType } from './types';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

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
        { provide: UserService, useClass: UserService },
        { provide: AuthService, useClass: AuthService },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    userService = module.get(UserService);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('registerUser', () => {
    it('should successfully register a user', async () => {
      // Arrange
      const userInput: CreateUserInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        roleId: RoleType.USER,
      };
      userService.create = jest.fn().mockResolvedValue(userInput);

      // Act
      const result = await resolver.registerUser(userInput);

      // Assert
      expect(result).toEqual(userInput);
      expect(userService.create).toHaveBeenCalledWith(userInput);
    });
  });

  describe('loginUser', () => {
    it('should successfully login a user', async () => {
      // Arrange
      const loginInput: LoginInput = {
        email: 'test@example.com',
        password: 'password123',
      };
      const user = { id: 1, email: loginInput.email, name: 'Test User' };
      authService.validateUser = jest.fn().mockResolvedValue(user);
      authService.generateJwtToken = jest.fn().mockReturnValue('token');

      // Act
      const result = await resolver.loginUser(loginInput);

      // Assert
      expect(result).toEqual({ user, token: 'token' });
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginInput.email,
        loginInput.password,
      );
    });
  });

  describe('viewUserProfile', () => {
    it('should successfully retrieve a user profile', async () => {
      // Arrange
      const user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        roleId: RoleType.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      // userService.findById.mockResolvedValue(user);
      userService.findById = jest.fn().mockResolvedValue(user);

      // Act
      const result = await resolver.viewUserProfile(user);

      delete user.createdAt;
      delete user.updatedAt;

      delete result.createdAt;
      delete result.updatedAt;

      // Assert
      expect(result).toEqual(user);
      expect(userService.findById).toHaveBeenCalledWith(user.id);
    });
  });

  describe('updateUserProfile', () => {
    it('should successfully update a user profile', async () => {
      // Arrange
      const currentUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
        roleId: RoleType.USER,
      };
      const updateData: UpdateUserInput = {
        id: currentUser.id,
        name: 'Updated User',
      };
      // userService.findById.mockResolvedValue(currentUser);
      // userService.update.mockResolvedValue({ ...currentUser, ...updateData });
      userService.findById = jest.fn().mockResolvedValue(currentUser);
      userService.update = jest
        .fn()
        .mockResolvedValue({ ...currentUser, ...updateData });

      // Act
      const result = await resolver.updateUserProfile(currentUser, updateData);

      delete currentUser.createdAt;
      delete currentUser.updatedAt;

      delete result.createdAt;
      delete result.updatedAt;

      // Assert
      expect(result).toEqual({ ...currentUser, ...updateData });
      expect(userService.update).toHaveBeenCalledWith(
        updateData.id,
        updateData,
      );
    });
  });
});
