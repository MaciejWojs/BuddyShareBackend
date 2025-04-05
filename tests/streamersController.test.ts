import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { 
  getAllStreamers, 
  getStreamerByUsername, 
  getStreamerModerators, 
  getStreamerModeratorByUsername,
  addStreamerModerator,
  deleteStreamerModerator 
} from '../src/controllers/streamersController';

// Mockowanie PrismaClient
vi.mock('@prisma/client', () => {
  const mockPrismaClient = {
    streamers: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    streamModerators: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    moderators: {
      create: vi.fn(),
    },
    usersInfo: {
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

describe('Kontroler Streamerów', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllStreamers', () => {
    it('powinno zwrócić wszystkich streamerów', async () => {
      // Mock dla streamerów
      const mockStreamers = [
        {
          streamerId: 1,
          userId: 1,
          user: {
            userInfo: {
              username: 'streamer1',
              email: 'streamer1@example.com'
            }
          }
        },
        {
          streamerId: 2,
          userId: 2,
          user: {
            userInfo: {
              username: 'streamer2',
              email: 'streamer2@example.com'
            }
          }
        }
      ];

      (mockPrisma.streamers.findMany as any).mockResolvedValue(mockStreamers);

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const req = {} as Request;
      const res = {
        status: statusMock
      } as unknown as Response;

      await getAllStreamers(req, res);

      expect(mockPrisma.streamers.findMany).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith(mockStreamers);
    });

    it('powinno obsłużyć błąd podczas pobierania streamerów', async () => {
      (mockPrisma.streamers.findMany as any).mockRejectedValue(new Error('Database error'));

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const req = {} as Request;
      const res = {
        status: statusMock
      } as unknown as Response;

      await getAllStreamers(req, res);

      expect(mockPrisma.streamers.findMany).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });

  describe('getStreamerByUsername', () => {
    it('powinno zwrócić dane streamera', async () => {
      // Mock dla streamera i userInfo
      const mockUserInfo = {
        username: 'streamer1',
        email: 'streamer1@example.com'
      };

      const mockStreamer = {
        streamerId: 1,
        userId: 1
      };

      const req = {
        userInfo: mockUserInfo,
        streamer: mockStreamer,
        body: {}
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      await getStreamerByUsername(req, res);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith(mockUserInfo);
    });

    it('powinno zwrócić błąd gdy brak userInfo lub streamera', async () => {
      const req = {
        body: {}
      } as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      await getStreamerByUsername(req, res);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });

  describe('getStreamerModerators', () => {
    it('powinno zwrócić moderatorów streamera', async () => {
      // Mock dla streamera i moderatorów
      const mockStreamer = {
        streamerId: 1,
        userId: 1
      };

      const mockModerators = [
        {
          streamModeratorId: 1,
          streamerId: 1,
          moderatorId: 1,
          moderator: {
            user: {
              userInfo: {
                username: 'mod1',
                email: 'mod1@example.com'
              }
            }
          }
        },
        {
          streamModeratorId: 2,
          streamerId: 1,
          moderatorId: 2,
          moderator: {
            user: {
              userInfo: {
                username: 'mod2',
                email: 'mod2@example.com'
              }
            }
          }
        }
      ];

      (mockPrisma.streamModerators.findMany as any).mockResolvedValue(mockModerators);

      const req = {
        streamer: mockStreamer,
        body: {}
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      await getStreamerModerators(req, res);

      expect(mockPrisma.streamModerators.findMany).toHaveBeenCalledWith({
        where: {
          streamerId: mockStreamer.streamerId
        },
        include: expect.any(Object)
      });
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith(mockModerators);
    });

    it('powinno zwrócić błąd gdy brak streamera', async () => {
      const req = {
        body: {}
      } as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      await getStreamerModerators(req, res);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });

  describe('getStreamerModeratorByUsername', () => {
    it('powinno zwrócić konkretnego moderatora streamera', async () => {
      // Mock dla streamera i moderatora
      const mockStreamer = {
        streamerId: 1,
        userId: 1
      };

      const mockModerator = {
        streamModeratorId: 1,
        streamerId: 1,
        moderatorId: 1,
        moderator: {
          user: {
            userInfo: {
              username: 'mod1',
              email: 'mod1@example.com'
            }
          }
        }
      };

      (mockPrisma.streamModerators.findFirst as any).mockResolvedValue(mockModerator);

      const req = {
        streamer: mockStreamer,
        params: { modusername: 'mod1' },
        body: {}
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      await getStreamerModeratorByUsername(req, res);

      expect(mockPrisma.streamModerators.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          streamerId: mockStreamer.streamerId
        }),
        include: expect.any(Object)
      }));
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith(mockModerator);
    });
  });

  describe('addStreamerModerator', () => {
    it('powinno dodać moderatora do streamera', async () => {
      // Mock dla streamera, moderatora i userInfo
      const mockStreamer = {
        streamerId: 1,
        userId: 1
      };

      const mockModerator = {
        moderatorId: 1,
        userId: 2
      };

      const mockUserInfo = {
        userInfoId: 2,
        username: 'mod1',
        email: 'mod1@example.com'
      };

      const mockStreamModerators = [
        {
          streamModeratorId: 1,
          streamerId: 1,
          moderatorId: 1,
          moderator: {
            user: {
              userInfo: {
                username: 'mod1',
                email: 'mod1@example.com'
              }
            }
          }
        }
      ];

      (mockPrisma.usersInfo.findUnique as any).mockResolvedValue(mockUserInfo);
      (mockPrisma.moderators.create as any).mockResolvedValue(mockModerator);
      (mockPrisma.streamModerators.create as any).mockResolvedValue({
        streamModeratorId: 1,
        streamerId: 1,
        moderatorId: 1
      });
      (mockPrisma.streamModerators.findMany as any).mockResolvedValue(mockStreamModerators);

      const req = {
        streamer: mockStreamer,
        moderator: null,
        params: { username: 'streamer1', modusername: 'mod1' },
        body: {},
        isModerator: false,
        isStreamerModerator: false
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      await addStreamerModerator(req, res);

      expect(mockPrisma.moderators.create).toHaveBeenCalled();
      expect(mockPrisma.streamModerators.create).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith(mockStreamModerators);
    });

    it('powinno nie dodawać moderatora jeśli już istnieje', async () => {
      // Mock dla streamera, moderatora i streamModerator
      const mockStreamer = {
        streamerId: 1,
        userId: 1
      };

      const mockModerator = {
        moderatorId: 1,
        userId: 2
      };

      const mockStreamerModerator = {
        streamModeratorId: 1,
        streamerId: 1,
        moderatorId: 1
      };

      const req = {
        streamer: mockStreamer,
        moderator: mockModerator,
        streamerModerator: mockStreamerModerator,
        params: { username: 'streamer1', modusername: 'mod1' },
        body: {},
        isModerator: true,
        isStreamerModerator: true
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      await addStreamerModerator(req, res);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    });
  });

  describe('deleteStreamerModerator', () => {
    it('powinno usunąć moderatora ze streamera', async () => {
      // Mock dla streamera, moderatora i streamModerator
      const mockStreamer = {
        streamerId: 1,
        userId: 1
      };

      const mockModerator = {
        moderatorId: 1,
        userId: 2
      };

      const mockStreamerModerator = {
        streamModeratorId: 1,
        streamerId: 1,
        moderatorId: 1
      };

      const mockStreamModerators = [];

      (mockPrisma.streamModerators.findFirst as any).mockResolvedValue(mockStreamerModerator);
      (mockPrisma.streamModerators.delete as any).mockResolvedValue(mockStreamerModerator);
      (mockPrisma.streamModerators.findMany as any).mockResolvedValue(mockStreamModerators);

      const req = {
        streamer: mockStreamer,
        moderator: mockModerator,
        streamerModerator: mockStreamerModerator,
        params: { username: 'streamer1', modusername: 'mod1' },
        body: {},
        isModerator: true,
        isStreamerModerator: true
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      const res = {
        status: statusMock
      } as unknown as Response;

      await deleteStreamerModerator(req, res);

      expect(mockPrisma.streamModerators.findFirst).toHaveBeenCalled();
      expect(mockPrisma.streamModerators.delete).toHaveBeenCalledWith({
        where: {
          streamModeratorId: mockStreamerModerator.streamModeratorId
        }
      });
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith(mockStreamModerators);
    });
  });
});
