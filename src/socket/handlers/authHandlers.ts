import { Server, Socket } from 'socket.io';
import { SocketState } from '../state';
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

    // Pobrane z middleware do autoryzacji socketów
    const username = socket.data.user.userInfo?.username;
    
    const room = `chat:${data.streamId}`;
    const chatMessage = {
      userId: socket.data.user.userId,
      username: username || "Anonymous",
      text: data.message,
      timestamp: new Date().toISOString(),
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