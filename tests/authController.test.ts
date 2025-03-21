import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { Request, Response } from 'express';
import { login, register, getMe, logout, test as authTest } from '../src/controllers/authController';
import * as hashUtils from '../src/utils/hash';

// Mockowanie process.env
vi.mock('process', () => {
    return {
        env: {
            JWT_ACCESS_SECRET: 'test_secret',
            SALT: 'test_salt',
            PEPPER: 'test_pepper'
        }
    };
});

// Mockowanie PrismaClient
vi.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findFirst: vi.fn(),
      create: vi.fn()
    },
    $disconnect: vi.fn()
  };
  
  return {
    PrismaClient: vi.fn(() => mockPrismaClient)
  };
});

// Dostęp do mockowanego PrismaClient
import { PrismaClient } from '@prisma/client';
const mockPrisma = new PrismaClient();

// Mockowanie JWT
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mock-jwt-token')
  }
}));

describe('Authentication Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login function', () => {
    it('should return 400 when username or password is missing', () => {
      // Przygotowanie mocków
      const req = {
        body: {}
      } as Request;
      
      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      
      const res = {
        status: statusMock
      } as unknown as Response;

      // Wykonanie testu
      login(req, res);

      // Asercje
      expect(statusMock).toBeCalledWith(400);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        success: false
      }));
    });

    it('should login successfully with valid credentials (username)', async () => {
      // Mock dla znalezionego użytkownika
      const mockUser = {
        id: 1,
        displayName: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash123',
        role: 'USER'
      };

      (mockPrisma.user.findFirst as any).mockResolvedValue(mockUser);

      const req = {
        body: {
          username: 'testuser',
          reqHASH: 'hash123'
        }
      } as Request;

      const jsonMock = vi.fn();
      const cookieMock = vi.fn().mockReturnValue({ json: jsonMock });
      
      const res = {
        cookie: cookieMock
      } as unknown as Response;

      await login(req, res);

      expect(mockPrisma.user.findFirst).toBeCalledWith({
        where: {
          displayName: 'testuser',
          passwordHash: 'hash123'
        }
      });

      expect(cookieMock).toBeCalledWith('JWT', 'mock-jwt-token', expect.objectContaining({
        signed: true,
        httpOnly: true
      }));

      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        success: true
      }));
    });

    it('should login successfully with valid credentials (email)', async () => {
      // Mock dla znalezionego użytkownika
      const mockUser = {
        id: 1,
        displayName: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash123',
        role: 'USER'
      };

      (mockPrisma.user.findFirst as any).mockResolvedValue(mockUser);

      const req = {
        body: {
          username: 'test@example.com', // używamy adresu email
          reqHASH: 'hash123'
        }
      } as Request;

      const jsonMock = vi.fn();
      const cookieMock = vi.fn().mockReturnValue({ json: jsonMock });
      
      const res = {
        cookie: cookieMock
      } as unknown as Response;

      await login(req, res);

      expect(mockPrisma.user.findFirst).toBeCalledWith({
        where: {
          email: 'test@example.com',
          passwordHash: 'hash123'
        }
      });

      expect(cookieMock).toBeCalled();
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        success: true
      }));
    });

    it('should return 401 with invalid credentials', async () => {
      (mockPrisma.user.findFirst as any).mockResolvedValue(null);

      const req = {
        body: {
          username: 'nonexistent',
          reqHASH: 'wronghash'
        }
      } as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      
      const res = {
        status: statusMock
      } as unknown as Response;

      await login(req, res);

      expect(statusMock).toBeCalledWith(401);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        success: false
      }));
    });
  });

  describe('register function', () => {
    beforeEach(() => {
      // Mock dla funkcji getPasswordHash
      vi.spyOn(hashUtils, 'getPasswordHash').mockReturnValue('mocked_hash');
    });

    it('should return 400 when required fields are missing', async () => {
      const req = {
        body: {
          username: 'testuser'
          // brakuje email i hasła
        }
      } as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      
      const res = {
        status: statusMock,
        json: jsonMock
      } as unknown as Response;

      await register(req, res);

      expect(statusMock).toBeCalledWith(400);
    });

    it('should return 400 when email format is invalid', async () => {
      const req = {
        body: {
          username: 'testuser',
          email: 'invalidemail', // niepoprawny format
          password: 'password123'
        }
      } as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      
      const res = {
        status: statusMock,
        json: jsonMock
      } as unknown as Response;

      await register(req, res);

      expect(statusMock).toBeCalledWith(400);
    });

    it('should return 409 when username already exists', async () => {
      (mockPrisma.user.findFirst as any)
        .mockResolvedValueOnce({ id: 1, displayName: 'existinguser' }) // dla sprawdzenia nazwy użytkownika
        .mockResolvedValueOnce(null); // dla sprawdzenia emaila

      const req = {
        body: {
          username: 'existinguser',
          email: 'new@example.com',
          password: 'password123'
        }
      } as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      
      const res = {
        status: statusMock,
        json: jsonMock
      } as unknown as Response;

      await register(req, res);

      expect(statusMock).toBeCalledWith(409);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        cause: 'username'
      }));
    });

    it('should return 409 when email already exists', async () => {
      (mockPrisma.user.findFirst as any)
        .mockResolvedValueOnce(null) // dla sprawdzenia nazwy użytkownika
        .mockResolvedValueOnce({ id: 1, email: 'existing@example.com' }); // dla sprawdzenia emaila

      const req = {
        body: {
          username: 'newuser',
          email: 'existing@example.com',
          password: 'password123'
        }
      } as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      
      const res = {
        status: statusMock,
        json: jsonMock
      } as unknown as Response;

      await register(req, res);

      expect(statusMock).toBeCalledWith(409);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        cause: 'email'
      }));
    });

    it('should register a new user successfully', async () => {
      (mockPrisma.user.findFirst as any).mockResolvedValue(null); // Żaden użytkownik jeszcze nie istnieje
      (mockPrisma.user.create as any).mockResolvedValue({
        id: 1,
        displayName: 'newuser',
        email: 'new@example.com',
        role: 'USER'
      });

      const req = {
        body: {
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123'
        }
      } as Request;

      const jsonMock = vi.fn();
      
      const res = {
        json: jsonMock
      } as unknown as Response;

      await register(req, res);

      expect(mockPrisma.user.create).toBeCalledWith({
        data: expect.objectContaining({
          displayName: 'newuser',
          email: 'new@example.com',
          passwordHash: 'mocked_hash'
        })
      });

      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        success: true
      }));
    });
  });

  describe('getMe function', () => {
    it('should return user data from request', async () => {
      const userData = { id: 1, displayName: 'testuser' };
      
      const req = {
        user: userData
      } as unknown as Request;

      const jsonMock = vi.fn().mockReturnValue({ status: vi.fn() });
      
      const res = {
        json: jsonMock
      } as unknown as Response;

      await getMe(req, res);

      expect(jsonMock).toBeCalledWith(userData);
    });
  });

  describe('logout function', () => {
    it('should clear JWT cookie and return success message', () => {
      const req = {} as Request;
      
      const jsonMock = vi.fn();
      const clearCookieMock = vi.fn().mockReturnValue({ json: jsonMock });
      const endMock = vi.fn();
      
      const res = {
        clearCookie: clearCookieMock,
        end: endMock
      } as unknown as Response;

      logout(req, res);

      expect(clearCookieMock).toBeCalledWith('JWT');
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        success: true
      }));
    });
  });
});