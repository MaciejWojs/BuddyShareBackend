import { Server, Socket } from 'socket.io';
import { SocketState, ChatMessage } from '../state';
import { sql } from 'bun';

export const handleAuthEvents = (socket: Socket, io: Server) => {
  const publicNsp = io.of("/public");

  // Obsługa zakończenia transmisji
  socket.on('endStream', (streamId: string) => {
    // Pobierz informacje o streamie przed usunięciem
    const streamInfo = SocketState.getStreamInfo(streamId);
    const viewerCount = streamInfo?.viewers || 0;

    // Zakończ stream
    SocketState.endStream(streamId);

    // Powiadom wszystkich o zakończeniu transmisji (publiczne)
    publicNsp.emit('streamEnded', {
      streamId,
      streamer: socket.data.user.userId,
      finalViewerCount: viewerCount
    });
  });


  // przyjmowanie i rozsyłanie wiadomości
  socket.on("sendChatMessage", async (data: { streamId: string; message: string }) => {
    if (!data.streamId || !data.message) {
      console.error("Invalid chat message data:", data);
      return;
    }

    const userId = socket.data.user.userId;
    const streamIdNum = Number(data.streamId);
    if (isNaN(streamIdNum)) {
      console.error("Invalid streamId (not a number):", data.streamId);
      return;
    }

    // Zapisz wiadomość do bazy i do state
    try {
      await SocketState.addChatMessage(streamIdNum, userId, data.message);
    } catch (error) {
      console.error("Failed to add chat message to the database:", error);
      return;
    }
    // Pobierz ostatnią wiadomość (dodana przed chwilą)
    const chatHistory = SocketState.getChatHistory(streamIdNum);
    const lastMsg = chatHistory.at(-1);
    if (!lastMsg) {
      console.error("Failed to fetch last chat message after insert");
      return;
    }

    const username = lastMsg.username || "Anonymous";
    const room = `chat:${data.streamId}`;
    const chatMessage: ChatMessage = {
      chatMessageId: lastMsg.chatMessageId,
      streamId: lastMsg.streamId,
      userId: lastMsg.userId,
      username,
      message: lastMsg.message,
      createdAt: lastMsg.createdAt,
      isDeleted: lastMsg.isDeleted,
      type: lastMsg.type,
      avatar: lastMsg.avatar || null,
    };

    console.log(`AUTH HANDLERS -> Received message for stream ${data.streamId}: ${data.message}`);
    console.log(`Message for ${room}:`, chatMessage);
    publicNsp.to(room).emit("chatMessage", chatMessage);
  });

  // Obsługa błędów połączenia
  socket.on('connectionError', (error: string) => {
    console.error(`Connection error for user ${socket.data.user.userId}: ${error}`);
  });
};