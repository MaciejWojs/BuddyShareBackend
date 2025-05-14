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
  SocketState.streams.forEach((streamInfo, streamId: string) => {
    if (streamInfo.roomMembers.has(socket.data.user.userId)) {
      const viewerCount = SocketState.removeViewer(streamId, socket.data.user.userId);
      io.of('/public').to(streamId).emit('viewerUpdate', viewerCount);
    }
  });

  // Sprawdź, czy użytkownik był streamerem i zakończ jego transmisje
  SocketState.streamers.forEach((streamerInfo, streamerId: string) => {
    if (streamerInfo.streamerName === socket.data.user.userId && streamerInfo.activeStreamId) {
      const streamId = streamerInfo.activeStreamId;
      SocketState.endStream(streamId);
      io.of('/public').emit('streamEnded', {
        streamId,
        streamer: streamerId,
        reason: 'disconnected'
      });
    }
  });
};

export const broadcastPatchStream = (streamData: {
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
  SocketState.patchStream(
    streamData.options_id.toString(),
    streamData.title,
    streamData.stream_description,
    streamData.category_name || 'default',
    streamData.tags || null,
    streamData.isPublic,
    streamData.thumbnail ? streamData.thumbnail : null)

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
  isPublic: boolean;
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

  console.log('Broadcasting new stream: ', 'ID: ', streamData.streamId, streamData.streamerId, streamData.title, streamData.description);

  try {
    const socketStreamId = streamData.streamId.toString();
    const socketStreamerId = streamData.streamerId.toString();

    console.log('streamerId', socketStreamerId);
    console.log('streamId', socketStreamId);

    // 1. Dodaj stream do pamięci
    SocketState.createStream(
      socketStreamId,
      socketStreamerId,
      streamData.title,
      streamData.description,
      streamData.category || 'default',
      streamData.streamerName,
      streamData.isPublic
    );

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

    // Pobierz informacje o streamie przed usunięciem
    const streamInfo = SocketState.getStreamInfo(socketStreamId);
    const viewerCount = streamInfo?.viewers || 0;

    // 1. Powiadom wszystkich o zakończeniu transmisji
    io.of('/public').emit('streamEnded', {
      streamId: socketStreamId,
      streamer: streamData.streamerId.toString(),
      streamerId: streamData.streamerId,
      streamerName: streamData.streamerName,
      finalViewerCount: viewerCount
    });

    // 2. Usuń informacje o streamie z pamięci
    SocketState.endStream(socketStreamId);
    SocketState.clearStreamHistory(socketStreamId);

    console.log(`Broadcasted stream end: ${socketStreamId} by ${streamData.streamerName}`);
    return true;
  } catch (error) {
    console.error('Error broadcasting stream end:', error);
    return false;
  }
};

// Interwał do wysyłania statystyk (5 sekund)
const STATS_INTERVAL = 5000;

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
    SocketState.streams.forEach((streamInfo, streamId) => {

      if (!streamInfo.metadata.isLive) return;

      const streamerName = streamInfo.metadata.streamerName;

      if (!streamerName) return;

      const viewerCount = streamInfo.viewers;
      const subscribersCount = streamInfo.subscribers;
      const followersCount = streamInfo.followers;

      SocketState.updateHistory(streamId);

      // Przygotuj kompletny pakiet statystyk
      const statsPackage = {
        streamId,
        timestamp: Date.now(),
        stats: {
          viewers: viewerCount,
          followers: followersCount,
          subscribers: subscribersCount
        },
        // Dołącz pełną historię danych
        history: streamInfo.history
      };

      // console.log('subscribers')

      // Wyślij te same dane do wszystkich zainteresowanych stron (pokój streamu)
      io!.of('/public').to(streamId).emit('streamStats', statsPackage);

      // console.log(`Emitting stats for stream ${streamId}: `, statsPackage);

      // Zapisz w logach tylko co 10 sekund, aby nie zaśmiecać konsoli
      if (Date.now() % 10000 < STATS_INTERVAL) {
        console.log(`Emitting stats for stream ${streamId}: ${viewerCount} viewers | ${subscribersCount} subscribers | ${followersCount} followers`);
      }
    });
  }, STATS_INTERVAL);
};