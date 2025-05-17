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
    console.log(`→ ${socket.id} joined chat room ${room}`);
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
    socket.data.streamId = streamId;

    // Używamy id gniazda jako id użytkownika dla niezalogowanych użytkowników
    const userId = socket.id;

    // Aktualizuj licznik widzów - używając nowej metody addViewer
    const viewerCount = SocketState.addViewer(streamId, userId);

    // Powiadom wszystkich o nowym widzu
    console.log(`updated viewer count for stream ${streamId}: ${viewerCount}`);
  });

  // Opuszczanie transmisji (publiczne)
  socket.on('leaveStream', (streamId: string) => {
    socket.leave(streamId);

    // Użyj id gniazda jako id użytkownika i zaktualizuj licznik widzów
    const userId = socket.id;
    const viewerCount = SocketState.removeViewer(streamId, userId);
    socket.data.streamId = null;
    console.log(`updated viewer count for stream ${streamId}: ${viewerCount}`);
  });

  socket.on('getAllMessages', (streamId: string) => {
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
    const streamIdNumber = parseInt(streamId);
    if (Number.isNaN(streamIdNumber)) {
      console.error("Invalid streamId, not a number:", streamId);
      return;
    }
    const chatHistory = SocketState.getChatHistory(streamIdNumber);
    if (!chatHistory) {
      console.error("Chat history not found for stream:", streamId);
      return;
    }
    const chatMessages = chatHistory.map((msg) => ({
      chatMessageId: msg.chatMessageId,
      streamId: msg.streamId,
      userId: msg.userId,
      username: msg.username,
      message: msg.message,
      createdAt: msg.createdAt,
      isDeleted: msg.isDeleted
    }));
    console.log(`Chat history for stream ${streamId}:`, chatMessages);
    socket.emit("allMessages", chatMessages);
  });

  // Odbieranie wiadomości z chatu (publiczne)
  socket.on('subscribeToChat', (streamId: string) => {
    socket.join(`chat:${streamId}`);
  });

  socket.on('unsubscribeFromChat', (streamId: string) => {
    socket.leave(`chat:${streamId}`);
  });
};