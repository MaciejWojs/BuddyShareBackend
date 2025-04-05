import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { isStreamer } from '../../src/middleware/isStreamer';

// Mockowanie PrismaClient
vi.mock('@prisma/client', () => {
  const mockPrismaClient = {
    streamers: {
      findUnique: vi.fn(),
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

describe('isStreamer Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('powinno dodać dane streamera do req i wywołać next() gdy użytkownik jest streamerem', async () => {
    // Mock dla streamera
    const mockStreamer = {
      streamerId: 1,
      userId: 10
    };

    (mockPrisma.streamers.findUnique as any).mockResolvedValue(mockStreamer);

    const req = {
      params: { username: 'streamer1' },
      userInfo: {
        user: {
          userId: 10
        }
      },
      body: {}
    } as unknown as Request;

    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    const res = {
      status: statusMock
    } as unknown as Response;

    const nextMock = vi.fn();

    await isStreamer(req, res, nextMock);

    expect(mockPrisma.streamers.findUnique).toHaveBeenCalledWith({
      where: {
        userId: 10
      }
    });
    expect(req.streamer).toEqual(mockStreamer);
    expect(nextMock).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
  });

  it('powinno zwrócić kod 400 gdy brak username', async () => {
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

    await isStreamer(req, res, nextMock);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Username is required'
    }));
    expect(nextMock).not.toHaveBeenCalled();
  });

  it('powinno zwrócić kod 400 gdy brak userInfo', async () => {
    const req = {
      params: { username: 'streamer1' },
      body: {}
    } as unknown as Request;

    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    const res = {
      status: statusMock
    } as unknown as Response;

    const nextMock = vi.fn();

    await isStreamer(req, res, nextMock);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.any(String)
    }));
    expect(nextMock).not.toHaveBeenCalled();
  });

  it('powinno zwrócić kod 404 gdy nie znaleziono streamera', async () => {
    (mockPrisma.streamers.findUnique as any).mockResolvedValue(null);

    const req = {
      params: { username: 'nonexistent' },
      userInfo: {
        user: {
          userId: 10
        }
      },
      body: {}
    } as unknown as Request;

    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    const res = {
      status: statusMock
    } as unknown as Response;

    const nextMock = vi.fn();

    await isStreamer(req, res, nextMock);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.any(String)
    }));
    expect(nextMock).not.toHaveBeenCalled();
  });

  it('powinno zwrócić kod 500 gdy wystąpi błąd w bazie danych', async () => {
    (mockPrisma.streamers.findUnique as any).mockRejectedValue(new Error('Database error'));

    const req = {
      params: { username: 'streamer1' },
      userInfo: {
        user: {
          userId: 10
        }
      },
      body: {}
    } as unknown as Request;

    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    const res = {
      status: statusMock
    } as unknown as Response;

    const nextMock = vi.fn();

    await isStreamer(req, res, nextMock);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.any(String)
    }));
    expect(nextMock).not.toHaveBeenCalled();
  });
});
