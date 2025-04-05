import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { authenticate, isAdmin, isStreamer, checkUserResourceOwnership } from '../../src/middleware/authenticate';
import jwt from 'jsonwebtoken';

// Mockowanie jwt i process.env
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn()
  }
}));

vi.mock('process', () => {
  return {
    env: {
      JWT_ACCESS_SECRET: 'test_secret'
    }
  };
});

// Mockowanie PrismaClient
vi.mock('@prisma/client', () => {
  const mockPrismaClient = {
    streamers: {
      findUnique: vi.fn(),
    },
    $disconnect: vi.fn()
  };

  return {
    PrismaClient: vi.fn(() => mockPrismaClient),
    Role: {
      ADMIN: 'ADMIN',
      USER: 'USER'
    }
  };
});

// Dostęp do mockowanego PrismaClient
import { PrismaClient } from '@prisma/client';
const mockPrisma = new PrismaClient();

describe('authenticate Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('JWT_ACCESS_SECRET', 'test_secret');
  });

  describe('authenticate', () => {
    it('powinno pomyślnie uwierzytelnić użytkownika z poprawnym tokenem', () => {
      const mockUser = { userId: 1, username: 'testuser' };
      (jwt.verify as any).mockImplementation((token, secret, callback) => {
        callback(null, mockUser);
      });

      const req = {
        signedCookies: {
          JWT: 'valid-token'
        }
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      const sendStatusMock = vi.fn();

      const res = {
        status: statusMock,
        sendStatus: sendStatusMock,
        json: jsonMock
      } as unknown as Response;

      const nextMock = vi.fn();

      authenticate(req, res, nextMock);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test_secret', expect.any(Function));
      expect(req.user).toEqual(mockUser);
      expect(nextMock).toHaveBeenCalled();
      expect(sendStatusMock).not.toHaveBeenCalled();
    });

    it('powinno zwrócić kod 400 gdy brak tokena JWT', () => {
      const req = {
        signedCookies: {}
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock,
        json: jsonMock
      } as unknown as Response;

      const nextMock = vi.fn();

      authenticate(req, res, nextMock);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'JWT'
      }));
      expect(nextMock).not.toHaveBeenCalled();
    });

    it('powinno zwrócić kod 401 gdy token JWT jest nieprawidłowy', () => {
      (jwt.verify as any).mockImplementation((_token: string, _secret: string, callback: (error: Error | null, decoded: any) => void) => {
        callback(new Error('Invalid token'), null);
      });

      const req = {
        signedCookies: {
          JWT: 'invalid-token'
        }
      } as unknown as Request;

      const sendStatusMock = vi.fn();

      const res = {
        sendStatus: sendStatusMock
      } as unknown as Response;

      const nextMock = vi.fn();

      authenticate(req, res, nextMock);

      expect(jwt.verify).toHaveBeenCalledWith('invalid-token', 'test_secret', expect.any(Function));
      expect(sendStatusMock).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
      expect(nextMock).not.toHaveBeenCalled();
    });
  });

  describe('isAdmin', () => {
    it('powinno przejść dalej gdy użytkownik jest adminem', () => {
      const req = {
        user: {
          userInfo: {
            userRole: 'ADMIN'
          }
        }
      } as unknown as Request;

      const sendStatusMock = vi.fn();

      const res = {
        sendStatus: sendStatusMock
      } as unknown as Response;

      const nextMock = vi.fn();

      isAdmin(req, res, nextMock);

      expect(nextMock).toHaveBeenCalled();
      expect(sendStatusMock).not.toHaveBeenCalled();
    });

    it('powinno zwrócić kod 403 gdy użytkownik nie jest adminem', () => {
      const req = {
        user: {
          userInfo: {
            userRole: 'USER'
          }
        }
      } as unknown as Request;

      const sendStatusMock = vi.fn();

      const res = {
        sendStatus: sendStatusMock
      } as unknown as Response;

      const nextMock = vi.fn();

      isAdmin(req, res, nextMock);

      expect(sendStatusMock).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
      expect(nextMock).not.toHaveBeenCalled();
    });
  });

  describe('isStreamer', () => {
    it('powinno przejść dalej gdy użytkownik jest streamerem', async () => {
      const mockStreamer = { streamerId: 1, userId: 10 };
      (mockPrisma.streamers.findUnique as any).mockResolvedValue(mockStreamer);

      const req = {
        user: { userId: 10 }
      } as unknown as Request;

      const sendStatusMock = vi.fn();

      const res = {
        sendStatus: sendStatusMock
      } as unknown as Response;

      const nextMock = vi.fn();

      await isStreamer(req, res, nextMock);

      expect(mockPrisma.streamers.findUnique).toHaveBeenCalledWith({
        where: {
          userId: 10
        }
      });
      expect(nextMock).toHaveBeenCalled();
      expect(sendStatusMock).not.toHaveBeenCalled();
    });

    it('powinno zwrócić kod 403 gdy użytkownik nie jest streamerem', async () => {
      (mockPrisma.streamers.findUnique as any).mockResolvedValue(null);

      const req = {
        user: { userId: 10 }
      } as unknown as Request;

      const sendStatusMock = vi.fn();

      const res = {
        sendStatus: sendStatusMock
      } as unknown as Response;

      const nextMock = vi.fn();

      await isStreamer(req, res, nextMock);

      expect(sendStatusMock).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
      expect(nextMock).not.toHaveBeenCalled();
    });
  });

  describe('checkUserResourceOwnership', () => {
    it('powinno przejść dalej gdy użytkownik próbuje dostać się do własnych zasobów', () => {
      const req = {
        user: {
          userInfo: {
            username: 'testuser'
          }
        },
        userInfo: {
          username: 'testuser'
        }
      } as unknown as Request;

      const sendStatusMock = vi.fn();

      const res = {
        sendStatus: sendStatusMock
      } as unknown as Response;

      const nextMock = vi.fn();

      checkUserResourceOwnership(req, res, nextMock);

      expect(nextMock).toHaveBeenCalled();
      expect(sendStatusMock).not.toHaveBeenCalled();
    });

    it('powinno zwrócić kod 403 gdy użytkownik próbuje dostać się do cudzych zasobów', () => {
      const req = {
        user: {
          userInfo: {
            username: 'testuser'
          }
        },
        userInfo: {
          username: 'otheruser'
        }
      } as unknown as Request;

      const sendStatusMock = vi.fn();

      const res = {
        sendStatus: sendStatusMock
      } as unknown as Response;

      const nextMock = vi.fn();

      checkUserResourceOwnership(req, res, nextMock);

      expect(sendStatusMock).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
      expect(nextMock).not.toHaveBeenCalled();
    });
  });
});
