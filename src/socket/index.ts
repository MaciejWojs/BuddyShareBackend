import { Server, Socket } from 'socket.io';
import { socketAuthMiddleware } from '../middleware/authenticate';
import { SocketState } from './state';
import { sql } from 'bun';
import { handlePublicEvents } from './handlers/publicHandlers';
import { handleAuthEvents } from './handlers/authHandlers';
import { isConstructorDeclaration } from 'typescript';

// Instancja Socket.IO
let io: Server | null = null;

/**
 * Konfiguracja głównego serwera Socket.IO
 */
export const setupSocketServer = (socketIo: Server) => {
  io = socketIo;

  // Inicjalizuj oba sockety
  initializePublicSocket(io);
  initializeSocket(io);

  startStatsEmission();

  return io;
};

/**
 * Pobierz instancję Socket.IO
 */
export const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.IO nie został zainicjalizowany');
  }
  return io;
};

/**
 * Inicjalizacja publicznego socketu (bez autoryzacji)
 */
export const initializePublicSocket = (io: Server) => {
  const publicIo = io.of('/public');

  publicIo.on('connection', (socket) => {
    console.log(`Public user connected: ${socket.id}`);

    // Podpięcie handlerów dla publicznych socketów
    handlePublicEvents(socket, io);

    socket.on('disconnect', () => {
      console.log(`Public user disconnected: ${socket.id}`);
    });
  });
};

/**
 * Inicjalizacja uwierzytelnionego socketu
 */
export const initializeSocket = (io: Server) => {
  const authIo = io.of('/auth');

  // Middleware do autoryzacji
  authIo.use(socketAuthMiddleware);

  authIo.on('connection', (socket) => {
    console.log(`User ${socket.data.user.userId} connected`);
    // console.log(`socket data: ${JSON.stringify(socket.data)}`);

    // Podpięcie handlerów dla uwierzytelnionych socketów
    handleAuthEvents(socket, io);

    socket.on('disconnect', () => {
      console.log(`User ${socket.data.user.userId} disconnected`);

      // Obsługa rozłączenia użytkownika
      // handleUserDisconnect(socket, io);
    });
  });
};

/**
 * Obsługa rozłączenia uwierzytelnionego użytkownika
 */
const handleUserDisconnect = (socket: Socket, io: Server) => {
  // Sprawdź, czy użytkownik oglądał jakieś transmisje i zaktualizuj liczniki
  SocketState.streamRooms.forEach((users, streamId: string) => {
    if (users.has(socket.data.user.userId)) {
      users.delete(socket.data.user.userId);
      const viewerCount = (SocketState.liveStreams.get(streamId) || 1) - 1;
      SocketState.liveStreams.set(streamId, Math.max(0, viewerCount));
      io.of('/public').to(streamId).emit('viewerUpdate', viewerCount);
    }
  });

  // Sprawdź, czy użytkownik był streamerem i zakończ jego transmisje
  SocketState.liveStreams.forEach((_, streamId: string) => {
    const metadata = SocketState.streamMetadata.get(streamId);
    if (metadata && metadata.streamerName === socket.data.user.userId) {
      SocketState.liveStreams.delete(streamId);
      SocketState.streamMetadata.delete(streamId);
      io.of('/public').emit('streamEnded', {
        streamId,
        streamer: socket.data.user.userId,
        reason: 'disconnected'
      });
    }
  });
};

export const broadcastStream = (streamData: {
  streamer_id: number;
  options_id: number;
  stream_description: string;
  title: string;
  thumbnail: string | null;
  isDeleted: boolean;
  isLive: boolean;
  path: string | null;
  isPublic: boolean;
  category_name: string | null;
  id: number;
  username: string;
  profile_picture: string;
  description: string;
  isBanned: boolean;
  created_at: string;
  updated_at: string;
  userRole: string;
  tags: any | null;
  stream_urls: {
    name: string;
    dash: string;
  }[];
}) => {
  if (!io) {
    console.error('Socket.IO nie został zainicjalizowany');
    return false;
  }

  // console.log('Broadcasting stream:', streamData.uris[0])

  io.of('/public').emit('patchStream', streamData);
}


/**
 * Broadcast nowej transmisji - wywoływany z kontrolera HTTP
 */
export const broadcastNewStream = async (streamData: {
  streamId: string | number;
  streamerId: string | number;
  streamerName: string;
  title: string;
  description: string;
  category?: string;
}, notifications: Array<{
  id: number;
  user_id: number;
  stream_id: number;
  message: string;
  created_at: string;
  isRead: boolean;
}>) => {
  if (!io) {
    console.error('Socket.IO nie został zainicjalizowany');
    return false;
  }

  try {
    const socketStreamId = streamData.streamId.toString();
    const socketStreamerId = streamData.streamerId.toString();

    // 1. Dodaj stream do pamięci
    SocketState.liveStreams.set(socketStreamId, 0);

    // 2. Zapisz metadane transmisji
    SocketState.streamMetadata.set(socketStreamId, {
      title: streamData.title,
      description: streamData.description,
      streamerName: streamData.streamerName,
      category: streamData.category || 'default'
    });

    // 3. Powiadom wszystkich o nowej transmisji

    // 4. Powiadom subskrybentów tego streamera
    // const subscribers = SocketState.streamSubscribers.get(socketStreamerId);
    await Promise.all(
      notifications.map((notif) => {
        const sockets = Array.from(io!.of('/auth').sockets.values()).filter(
          (s) => s.data.user?.userId === notif.user_id
        );
        console.log(`Notifying subscriber ${notif.user_id} about new stream`);
        sockets.forEach((s) => s.emit('streamNotification', notif));
      })
    );

    console.log(`Broadcasted new stream: ${streamData.title} by ${streamData.streamerName}`);
    return true;
  } catch (error) {
    console.error('Error broadcasting new stream:', error);
    return false;
  }
};

export const notifyStreamer = (streamId: string | number, streamerUserId: string, streamerName: string, message: string = "Stream is not public click here to change that.") => {
  if (!io) {
    console.error('Socket.IO nie został zainicjalizowany');
    return;
  }
  try {
    const sockets = Array.from(io.of('/auth').sockets.values()).filter(
      (s) => {
        console.log(s.data.user?.userId, streamerUserId);
        return s.data.user?.userId == streamerUserId
      }
    );

    const payload = {
      message: message,
      userId: streamerUserId,
      streamerName: streamerName,
      type: 'dismissable',
      stream_id: streamId,
      isRead: false,
      createdAt: new Date().toISOString()
    }

    console.log(`valid sockets: ${sockets.length}`);
    sockets.forEach((s) => {
      console.log(s.id, " -> ", payload)
      s.emit('notifyStreamer', payload)
    });
    console.log(`Notified streamer ${streamerUserId}[${streamerName}] with message: ${message}`);
  } catch (error) {
    console.error('Error notifying streamer:', error);
  }
}

/**
 * Broadcast zakończenia transmisji - wywoływany z kontrolera HTTP
 */
export const broadcastStreamEnd = (streamData: {
  streamId: string | number;
  streamerId: string | number;
  streamerName: string;
}) => {
  if (!io) {
    console.error('Socket.IO nie został zainicjalizowany');
    return false;
  }

  try {
    const socketStreamId = streamData.streamId.toString();

    // Pobierz statystyki przed usunięciem
    const viewerCount = SocketState.liveStreams.get(socketStreamId) || 0;

    // 1. Powiadom wszystkich o zakończeniu transmisji
    io.of('/public').emit('streamEnded', {
      streamId: socketStreamId,
      streamer: streamData.streamerId.toString(),
      streamerId: streamData.streamerId,
      streamerName: streamData.streamerName,
      finalViewerCount: viewerCount
    });

    // 2. Usuń informacje o streamie z pamięci
    SocketState.liveStreams.delete(socketStreamId);
    SocketState.streamMetadata.delete(socketStreamId);
    SocketState.clearStreamHistory(socketStreamId);

    console.log(`Broadcasted stream end: ${socketStreamId} by ${streamData.streamerName}`);
    return true;
  } catch (error) {
    console.error('Error broadcasting stream end:', error);
    return false;
  }
};

// Interwał do wysyłania statystyk (1 sekunda)
const STATS_INTERVAL = 1000;

/**
 * Rozpocznij regularną emisję statystyk dla wszystkich aktywnych streamów
 */
export const startStatsEmission = () => {
  if (!io) {
    console.error('Socket.IO nie został zainicjalizowany');
    return;
  }

  setInterval(() => {
    // Dla każdego aktywnego streamu wyślij statystyki
    SocketState.liveStreams.forEach((viewerCount, streamId) => {
      const streamerName = SocketState.streamMetadata.get(streamId)?.streamerName;

      if (!streamerName) return;

      // Aktualizuj wszystkie historie statystyk
      SocketState.updateViewerHistory(streamId, viewerCount);
      SocketState.updateFollowerHistory(streamerName);
      SocketState.updateSubscriberHistory(streamerName);

      // Przygotuj kompletny pakiet statystyk
      const statsPackage = {
        streamId,
        timestamp: Date.now(),
        stats: {
          viewers: viewerCount,
          followers: SocketState.streamFollowers.get(streamerName)?.size || 0,
          subscribers: SocketState.streamSubscribers.get(streamerName)?.size || 0
        },
        // Dołącz pełną historię danych
        history: {
          viewers: SocketState.viewerHistory.get(streamId) || [],
          followers: SocketState.followerHistory.get(streamerName) || [],
          subscribers: SocketState.subscriberHistory.get(streamerName) || []
        }
      };

      // Wyślij te same dane do wszystkich zainteresowanych stron (pokój streamu)
      io!.of('/public').to(streamId).emit('streamStats', statsPackage);

      // Zapisz w logach tylko co 10 sekund, aby nie zaśmiecać konsoli
      if (Date.now() % 10000 < STATS_INTERVAL) {
        console.log(`Emitting stats for stream ${streamId}: ${viewerCount} viewers`);
      }
    });
  }, STATS_INTERVAL);
};