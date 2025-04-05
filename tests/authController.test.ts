import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
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

// Mockowanie PrismaClient zgodnie z aktualnym schematem bazy danych
vi.mock('@prisma/client', () => {
  const mockPrismaClient = {
    users: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    usersInfo: {
      findUnique: vi.fn(),
      findFirst: vi.fn()
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

describe('Kontroler Autentykacji', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('funkcja login', () => {
    it('powinno zwrócić kod 400 gdy brak nazwy użytkownika lub hasła', () => {
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
      expect(statusMock).toBeCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        success: false,
        message: 'Missing required fields: username and passwordHash'
      }));
    });

    it('powinno pomyślnie zalogować z poprawnymi danymi (nazwa użytkownika)', async () => {
      // Mock dla znalezionego użytkownika zgodnie z nową strukturą
      const mockUser = {
        userId: 1,
        userInfo: {
          username: 'testuser',
          email: 'test@example.com',
          isBanned: false
        },
      };

      (mockPrisma.users.findFirst as any).mockResolvedValue(mockUser);

      const req = {
        body: {
          username: 'testuser',
          passwordHash: 'hash123'
        }
      } as Request;

      const jsonMock = vi.fn();
      const cookieMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        cookie: cookieMock,
        status: statusMock
      } as unknown as Response;

      cookieMock.mockReturnValue(res);

      await login(req, res);

      expect(mockPrisma.users.findFirst).toBeCalledWith({
        where: {
          userInfo: {
            username: 'testuser'
          },
          userSettings: {
            passwordHash: 'hash123'
          }
        },
        include: {
          userInfo: true
        }
      });

      expect(cookieMock).toBeCalledWith('JWT', 'mock-jwt-token', expect.objectContaining({
        signed: true,
        httpOnly: true,
        secure: true
      }));

      expect(statusMock).toBeCalledWith(StatusCodes.OK);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        success: true,
        message: 'Authentication successful'
      }));
    });

    it('powinno pomyślnie zalogować z poprawnymi danymi (email)', async () => {
      // Mock dla znalezionego użytkownika zgodnie z nową strukturą
      const mockUser = {
        userId: 1,
        userInfo: {
          username: 'testuser',
          email: 'test@example.com',
          isBanned: false
        },
      };

      (mockPrisma.users.findFirst as any).mockResolvedValue(mockUser);

      const req = {
        body: {
          username: 'test@example.com', // używamy adresu email
          passwordHash: 'hash123'
        }
      } as Request;

      const jsonMock = vi.fn();
      const cookieMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        cookie: cookieMock,
        status: statusMock
      } as unknown as Response;

      cookieMock.mockReturnValue(res);

      await login(req, res);

      expect(mockPrisma.users.findFirst).toBeCalledWith({
        where: {
          userInfo: {
            email: 'test@example.com'
          },
          userSettings: {
            passwordHash: 'hash123'
          }
        },
        include: {
          userInfo: true
        }
      });

      expect(cookieMock).toBeCalled();
      expect(statusMock).toBeCalledWith(StatusCodes.OK);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        success: true,
        message: 'Authentication successful'
      }));
    });

    it('powinno zwrócić kod 401 dla nieprawidłowych danych logowania', async () => {
      (mockPrisma.users.findFirst as any).mockResolvedValue(null);

      const req = {
        body: {
          username: 'nonexistent',
          passwordHash: 'wronghash'
        }
      } as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      await login(req, res);

      expect(statusMock).toBeCalledWith(StatusCodes.UNAUTHORIZED);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        success: false,
        cause: "credentials",
        message: 'Invalid credentials'
      }));
    });

    it('powinno zwrócić kod 401 gdy użytkownik jest zbanowany', async () => {
      // Mock dla zbanowanego użytkownika
      const mockUser = {
        userId: 1,
        userInfo: {
          username: 'testuser',
          email: 'test@example.com',
          isBanned: true
        },
      };

      (mockPrisma.users.findFirst as any).mockResolvedValue(mockUser);

      const req = {
        body: {
          username: 'testuser',
          passwordHash: 'hash123'
        }
      } as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      await login(req, res);

      expect(statusMock).toBeCalledWith(StatusCodes.UNAUTHORIZED);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        success: false,
        cause: "banned",
        message: 'User is banned'
      }));
    });

    it('powinno zwrócić kod 500 gdy wystąpi problem z bazą danych', async () => {
      // Mockowanie błędu z bazy danych
      (mockPrisma.users.findFirst as any).mockRejectedValue(new Error('Database error'));

      const req = {
        body: {
          username: 'testuser',
          passwordHash: 'hash123'
        }
      } as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      await login(req, res);

      expect(statusMock).toBeCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        success: false,
        message: 'Internal server error during authentication'
      }));
    });
  });

  describe('funkcja register', () => {
    beforeEach(() => {
      // Mock dla funkcji getPasswordHash
      vi.spyOn(hashUtils, 'getPasswordHash').mockReturnValue('mocked_hash');
    });

    it('powinno zwrócić kod 400 gdy brakuje wymaganych pól', async () => {
      const req = {
        body: {
          username: 'testuser'
          // brakuje email i hasła
        }
      } as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      await register(req, res);

      expect(statusMock).toBeCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('Missing required fields')
      }));
    });

    it('powinno zwrócić kod 400 gdy format email jest niepoprawny', async () => {
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
        status: statusMock
      } as unknown as Response;

      await register(req, res);

      expect(statusMock).toBeCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('Invalid email')
      }));
    });

    it('powinno zwrócić kod 409 gdy nazwa użytkownika już istnieje', async () => {
      (mockPrisma.usersInfo.findUnique as any)
        .mockResolvedValue({ userInfoId: 1, username: 'existinguser' });

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
        status: statusMock
      } as unknown as Response;

      await register(req, res);

      expect(statusMock).toBeCalledWith(StatusCodes.CONFLICT);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        success: false,
        cause: "username",
        message: 'Username already exists'
      }));
    });

    it('powinno zwrócić kod 409 gdy email już istnieje', async () => {
      (mockPrisma.usersInfo.findUnique as any).mockResolvedValue(null);
      (mockPrisma.usersInfo.findFirst as any)
        .mockResolvedValue({ userInfoId: 1, email: 'existing@example.com' });

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
        status: statusMock
      } as unknown as Response;

      await register(req, res);

      expect(statusMock).toBeCalledWith(StatusCodes.CONFLICT);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        success: false,
        cause: "email",
        message: 'Email already exists'
      }));
    });

    it('powinno pomyślnie zarejestrować nowego użytkownika', async () => {
      (mockPrisma.usersInfo.findUnique as any).mockResolvedValue(null);
      (mockPrisma.usersInfo.findFirst as any).mockResolvedValue(null);
      (mockPrisma.users.create as any).mockResolvedValue({
        userId: 1,
        userInfo: {
          username: 'newuser',
          email: 'new@example.com',
        }
      });

      const req = {
        body: {
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123'
        }
      } as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      await register(req, res);

      expect(mockPrisma.users.create).toBeCalledWith({
        data: expect.objectContaining({
          userInfo: {
            create: {
              username: 'newuser',
              email: 'new@example.com',
            }
          },
          userSettings: {
            create: {
              passwordHash: 'mocked_hash'
            }
          }
        })
      });

      expect(statusMock).toBeCalledWith(StatusCodes.CREATED);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        success: true,
        message: expect.any(String)
      }));
    });
  });

  describe('funkcja getMe', () => {
    it('powinno zwrócić dane użytkownika z żądania', async () => {
      const userData = { id: 1, username: 'testuser' };

      const req = {
        user: userData
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      await getMe(req, res);

      expect(statusMock).toBeCalledWith(StatusCodes.OK);
      expect(jsonMock).toBeCalledWith(userData);
    });
  });

  describe('funkcja logout', () => {
    it('powinno usunąć ciasteczko JWT i zwrócić komunikat pomyślnego wylogowania', () => {
      const req = {} as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      const clearCookieMock = vi.fn().mockReturnValue({ status: statusMock });

      const res = {
        clearCookie: clearCookieMock
      } as unknown as Response;

      logout(req, res);

      expect(clearCookieMock).toBeCalledWith('JWT');
      expect(statusMock).toBeCalledWith(StatusCodes.OK);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        success: true,
        message: 'User logged out successfully'
      }));
    });
  });

  describe('funkcja test', () => {
    it('powinno zwrócić dane uwierzytelnionego użytkownika', () => {
      const userData = { id: 1, displayName: 'testuser' };

      const req = {
        user: userData
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      authTest(req, res);

      expect(statusMock).toBeCalledWith(StatusCodes.OK);
      expect(jsonMock).toBeCalledWith(expect.objectContaining({
        success: true,
        message: 'Authentication test successful',
        user: userData
      }));
    });
  });
});