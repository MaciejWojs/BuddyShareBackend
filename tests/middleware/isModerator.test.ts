import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { isModerator, isStreamerModerator } from '../../src/middleware/isModerator';

// Mockowanie PrismaClient
vi.mock('@prisma/client', () => {
  const mockPrismaClient = {
    moderators: {
      findFirst: vi.fn(),
    },
    streamModerators: {
      findFirst: vi.fn(),
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

describe('isModerator Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isModerator', () => {
    it('powinno ustawić isModerator=true i dodać moderatora do req gdy użytkownik jest moderatorem', async () => {
      const mockModerator = {
        moderatorId: 1,
        userId: 10
      };

      (mockPrisma.moderators.findFirst as any).mockResolvedValue(mockModerator);

      const req = {
        params: { modusername: 'mod1' },
        body: {}
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      const nextMock = vi.fn();

      await isModerator(req, res, nextMock);

      expect(mockPrisma.moderators.findFirst).toHaveBeenCalledWith({
        where: {
          user: {
            userInfo: {
              username: 'mod1'
            }
          }
        }
      });
      expect(req.isModerator).toBe(true);
      expect(req.moderator).toEqual(mockModerator);
      expect(nextMock).toHaveBeenCalled();
    });

    it('powinno ustawić isModerator=false gdy użytkownik nie jest moderatorem', async () => {
      (mockPrisma.moderators.findFirst as any).mockResolvedValue(null);

      const req = {
        params: { modusername: 'notmod' },
        body: {}
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      const nextMock = vi.fn();

      await isModerator(req, res, nextMock);

      expect(req.isModerator).toBe(false);
      expect(req.moderator).toBeUndefined();
      expect(nextMock).toHaveBeenCalled();
    });

    it('powinno zwrócić kod 400 gdy brak nazwy moderatora', async () => {
      const req = {
        params: {},
        body: {}
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      const nextMock = vi.fn();

      await isModerator(req, res, nextMock);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
      expect(nextMock).not.toHaveBeenCalled();
    });

    it('powinno zwrócić kod 500 gdy wystąpi błąd w bazie danych', async () => {
      (mockPrisma.moderators.findFirst as any).mockRejectedValue(new Error('Database error'));

      const req = {
        params: { modusername: 'mod1' },
        body: {}
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      const nextMock = vi.fn();

      await isModerator(req, res, nextMock);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
      expect(nextMock).not.toHaveBeenCalled();
    });
  });

  describe('isStreamerModerator', () => {
    it('powinno ustawić isStreamerModerator=true gdy moderator jest moderatorem streamera', async () => {
      const mockStreamerModerator = {
        streamModeratorId: 1,
        streamerId: 5,
        moderatorId: 2,
        moderator: {
          moderatorId: 2,
          user: {
            userInfo: {
              username: 'mod1'
            }
          }
        }
      };

      (mockPrisma.streamModerators.findFirst as any).mockResolvedValue(mockStreamerModerator);

      const req = {
        params: { modusername: 'mod1' },
        moderator: { moderatorId: 2 },
        streamer: { streamerId: 5 },
        isModerator: true,
        body: {}
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      const nextMock = vi.fn();

      await isStreamerModerator(req, res, nextMock);

      expect(mockPrisma.streamModerators.findFirst).toHaveBeenCalledWith({
        where: {
          moderatorId: 2,
          streamerId: 5
        },
        include: expect.any(Object)
      });
      expect(req.isStreamerModerator).toBe(true);
      expect(req.streamerModerator).toEqual(mockStreamerModerator);
      expect(nextMock).toHaveBeenCalled();
    });

    it('powinno ustawić isStreamerModerator=false gdy moderator nie jest moderatorem streamera', async () => {
      (mockPrisma.streamModerators.findFirst as any).mockResolvedValue(null);

      const req = {
        params: { modusername: 'mod1' },
        moderator: { moderatorId: 2 },
        streamer: { streamerId: 5 },
        isModerator: true,
        body: {}
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      const nextMock = vi.fn();

      await isStreamerModerator(req, res, nextMock);

      expect(req.isStreamerModerator).toBe(false);
      expect(nextMock).toHaveBeenCalled();
    });

    it('powinno przejść do następnego middleware gdy użytkownik nie jest moderatorem', async () => {
      const req = {
        params: { modusername: 'mod1' },
        streamer: { streamerId: 5 },
        isModerator: false,
        body: {}
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      const nextMock = vi.fn();

      await isStreamerModerator(req, res, nextMock);

      expect(mockPrisma.streamModerators.findFirst).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalled();
    });

    it('powinno zwrócić kod 400 gdy brak streamera lub nazwy moderatora', async () => {
      const req = {
        params: { modusername: 'mod1' },
        isModerator: true,
        body: {}
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      const nextMock = vi.fn();

      await isStreamerModerator(req, res, nextMock);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
      expect(nextMock).not.toHaveBeenCalled();
    });

    it('powinno zwrócić kod 500 gdy wystąpi błąd w bazie danych', async () => {
      (mockPrisma.streamModerators.findFirst as any).mockRejectedValue(new Error('Database error'));

      const req = {
        params: { modusername: 'mod1' },
        moderator: { moderatorId: 2 },
        streamer: { streamerId: 5 },
        isModerator: true,
        body: {}
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      const nextMock = vi.fn();

      await isStreamerModerator(req, res, nextMock);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
      expect(nextMock).not.toHaveBeenCalled();
    });
  });
});
