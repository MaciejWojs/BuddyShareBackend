import { Server, Socket } from 'socket.io';
import { SocketState } from '../state';

export const handlePublicEvents = (socket: Socket, io: Server) => {

  // dołączanie do pokoju czatowego
  socket.on("joinChatRoom", (streamId: string) => {
    if (!streamId) {
      console.error("Invalid streamId:", streamId);
      return;
    }
    const stream = SocketState.getStreamInfo(streamId);
    if (!stream) {
      console.error("Stream not found:", streamId);
      return;
    }

    if (!stream.metadata.isPublic) {
      console.error("Stream is not public:", streamId);
      return;
    }

    const room = `chat:${streamId}`;
    socket.join(room);
    console.log(`→ ${socket.id} joined room ${room}`);
  });

  // opuszczanie pokoju czatowego
  socket.on("leaveChatRoom", (streamId: string) => {
    const room = `chat:${streamId}`;
    socket.leave(room);
    console.log(`← ${socket.id} left room ${room}`);
  });

  // // Dołączanie do transmisji jako widz (publiczne)
  socket.on('joinStream', async (streamId: string, statsOnly = false) => {
      if (!streamId) {
      console.error("Invalid streamId:", streamId);
      return;
    }
    const stream = SocketState.getStreamInfo(streamId);
    if (!stream) {
      console.error("Stream not found:", streamId);
      return;
    }

    if (!stream.metadata.isPublic) {
      console.error("Stream is not public:", streamId);
      return;
    }
    socket.join(streamId);

    console.log(`Someone joined stream ${streamId}`);
    if (statsOnly) {
      return;
    }

    // Używamy id gniazda jako id użytkownika dla niezalogowanych użytkowników
    const userId = socket.id;

    // Aktualizuj licznik widzów - używając nowej metody addViewer
    const viewerCount = SocketState.addViewer(streamId, userId);

    // Powiadom wszystkich o nowym widzu
    io.of('/public').to(streamId).emit('viewerUpdate', viewerCount);
    console.log(`updated viewer count for stream ${streamId}: ${viewerCount}`);
  });

  // Opuszczanie transmisji (publiczne)
  socket.on('leaveStream', (streamId: string) => {
    socket.leave(streamId);

    // Użyj id gniazda jako id użytkownika i zaktualizuj licznik widzów
    const userId = socket.id;
    const viewerCount = SocketState.removeViewer(streamId, userId);

    io.of('/public').to(streamId).emit('viewerUpdate', viewerCount);
  });

  // Odbieranie wiadomości z chatu (publiczne)
  socket.on('subscribeToChat', (streamId: string) => {
    socket.join(`chat:${streamId}`);
  });

  socket.on('unsubscribeFromChat', (streamId: string) => {
    socket.leave(`chat:${streamId}`);
  });
};