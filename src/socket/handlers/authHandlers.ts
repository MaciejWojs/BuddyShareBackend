import { Server, Socket } from 'socket.io';
import { SocketState, ChatMessage, BanOptions } from '../state';
import { sql } from 'bun';

enum ChatAction {
  // EDIT = 'edit',
  DELETE = 'delete',
  TIMEOUT = 'timeout',
  UNTIMEOUT = 'untimeout',
  UNBAN = 'unban',
  BAN = 'ban',
}


export const handleAuthEvents = (socket: Socket, io: Server) => {
  const publicNsp = io.of("/public");

  // Pomocnicza funkcja do walidacji streama
  const validateStream = (streamId: number) => {
    const stream = SocketState.getStreamInfo(String(streamId));
    if (!stream) {
      console.error("Stream not found:", streamId);
      return null;
    }
    if (!stream.metadata.isPublic) {
      console.error("Stream is not public:", streamId);
      return null;
    }
    return stream;
  };

  // Pomocnicza funkcja do powiadamiania o zmianach listy zbanowanych użytkowników
  const notifyBannedUsersUpdate = (streamId: number, room: string) => {
    const bannedUsers = SocketState.getBannedUsers(streamId);
    console.log(`[notifyBannedUsersUpdate] Banned users updated for stream ${streamId}:`, bannedUsers);
    publicNsp.to(room).emit("bannedUsersUpdated", { streamId, bannedUsers });
  };

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
      const success = await SocketState.addChatMessage(streamIdNum, userId, data.message);
      if (!success) {
        socket.emit("chatMessageError", { message: "You are not allowed to send messages on this streamer's chat." });
        console.error("User is not allowed to send messages in this stream:", userId);
        return;
      }
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

  socket.on('manageChat', async (message: ChatMessage, action: ChatAction, options?: BanOptions) => {
    console.log("manageChat", message, action);

    // Walidacja danych wejściowych
    if (!message.streamId) {
      console.error("Invalid streamId:", message.streamId);
      return;
    }

    const stream = validateStream(message.streamId);
    if (!stream) return;

    const room = `chat:${message.streamId}`;

    switch (action) {
      case ChatAction.DELETE:
        const updatedMessage = await SocketState.deleteChatMessage(message);
        io.of('/public').to(room).emit("patchChatMessage", updatedMessage);
        console.log(`Deleted message ${message.chatMessageId} from stream ${message.streamId}`);
        break;
      // case ChatAction.TIMEOUT:
      //   SocketState.timeoutUser(message.userId, message.streamId);
      //   break;
      // case ChatAction.UNTIMEOUT:
      //   SocketState.untimeoutUser(message.userId, message.streamId);
      //   break;
      case ChatAction.BAN:
        // Sprawdź czy użytkownik już jest zbanowany
        const bannedUsers = SocketState.getBannedUsers(message.streamId);
        if (bannedUsers.includes(String(message.userId))) {
          socket.emit("banUserStatus", {
            message: `User ${message.userId} is already banned.`,
            success: false
          });
          break;
        }
        
        const banSuccess = await SocketState.banUser(message.userId, message.streamId, options);
        socket.emit("banUserStatus", {
          message: banSuccess
            ? `User ${message.userId} has been banned successfully.`
            : `Failed to ban user ${message.userId}.`,
          success: banSuccess
        });
        if (banSuccess) {
          notifyBannedUsersUpdate(message.streamId, room);
        }
        break;
      case ChatAction.UNBAN:
        // Sprawdź czy użytkownik rzeczywiście jest zbanowany
        const currentBannedUsers = SocketState.getBannedUsers(message.streamId);
        if (!currentBannedUsers.includes(String(message.userId))) {
          socket.emit("unbanUserStatus", {
            message: `User ${message.userId} is not banned.`,
            success: false
          });
          break;
        }
        
        const unbanSuccess = await SocketState.unbanUser(message.userId, message.streamId);
        socket.emit("unbanUserStatus", {
          message: unbanSuccess
            ? `User ${message.userId} has been unbanned successfully.`
            : `Failed to unban user ${message.userId}.`,
          success: unbanSuccess
        });
        if (unbanSuccess) {
          notifyBannedUsersUpdate(message.streamId, room);
        }
        break;
      default:
        console.error("Invalid action:", action);
        return;
    }
    // socket.to(room).emit("manageChat", data);
  })

  // Obsługa błędów połączenia
  socket.on('connectionError', (error: string) => {
    console.error(`Connection error for user ${socket.data.user.userId}: ${error}`);
  });
};