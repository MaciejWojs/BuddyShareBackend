import { Server, Socket } from 'socket.io';
import { SocketState } from '../state';

export const handleAuthEvents = (socket: Socket, io: Server) => {
  const publicNsp = io.of("/public");

  // Obsługa zakończenia transmisji
  socket.on('endStream', (streamId: string) => {
    // Zapisz statystyki przed usunięciem
    const viewerCount = SocketState.liveStreams.get(streamId) || 0;
    const metadata = SocketState.streamMetadata.get(streamId);

    SocketState.liveStreams.delete(streamId);
    SocketState.streamMetadata.delete(streamId);

    // Powiadom wszystkich o zakończeniu transmisji (publiczne)
    publicNsp.emit('streamEnded', {
      streamId,
      streamer: socket.data.user.userId,
      finalViewerCount: viewerCount
    });
  });



  // przyjmowanie i rozsyłanie wiadomości
  socket.on("sendChatMessage", (data: { streamId: string; message: string }) => {
    if (!data.streamId || !data.message) {
      console.error("Invalid chat message data:", data);
      return;
    }
    const room = `chat:${data.streamId}`;
    const chatMessage = {
      userId: socket.data.user.userId,
      username: socket.data.user.username || socket.data.user.userId,
      text: data.message,
      timestamp: new Date().toISOString(),
    };

    console.log(`AUTH HANDLERS -> Received message for stream ${data.streamId}: ${data.message}`);

    console.log(`Message for ${room}:`, chatMessage);
    publicNsp.to(room).emit("chatMessage", chatMessage);
  });

  // Obsługa obserwowania streamera
  socket.on('followStreamer', (streamerId: string) => {
    if (!SocketState.streamFollowers.has(streamerId)) {
      SocketState.streamFollowers.set(streamerId, new Set());
    }

    SocketState.streamFollowers.get(streamerId)?.add(socket.data.user.userId);

    // Powiadom streamera o nowym obserwującym
    const streamerSockets = Array.from(io.of('/auth').sockets.values())
      .filter(s => s.data.user?.userId === streamerId);

    streamerSockets.forEach(streamerSocket => {
      streamerSocket.emit('newFollower', {
        followerId: socket.data.user.userId,
        followerName: socket.data.user.username || socket.data.user.userId
      });
    });

    // Zaktualizuj licznik obserwujących (publiczne)
    publicNsp.emit('followerCountUpdate', {
      streamerId,
      count: SocketState.streamFollowers.get(streamerId)?.size || 0
    });
  });

  // Obsługa przestania obserwowania streamera
  socket.on('unfollowStreamer', (streamerId: string) => {
    SocketState.streamFollowers.get(streamerId)?.delete(socket.data.user.userId);

    // Zaktualizuj licznik obserwujących (publiczne)
    publicNsp.emit('followerCountUpdate', {
      streamerId,
      count: SocketState.streamFollowers.get(streamerId)?.size || 0
    });
  });

  // Obsługa subskrypcji streamera (tylko zalogowani)
  socket.on('subscribeToStreamer', (streamerId: string) => {
    if (!SocketState.streamSubscribers.has(streamerId)) {
      SocketState.streamSubscribers.set(streamerId, new Set());
    }

    SocketState.streamSubscribers.get(streamerId)?.add(socket.data.user.userId);

    // Powiadom streamera o nowym subskrybencie
    const streamerSockets = Array.from(io.of('/auth').sockets.values())
      .filter(s => s.data.user?.userId === streamerId);

    streamerSockets.forEach(streamerSocket => {
      streamerSocket.emit('newSubscriber', {
        subscriberId: socket.data.user.userId,
        subscriberName: socket.data.user.username || socket.data.user.userId
      });
    });
  });

  // Obsługa anulowania subskrypcji
  socket.on('unsubscribeFromStreamer', (streamerId: string) => {
    SocketState.streamSubscribers.get(streamerId)?.delete(socket.data.user.userId);
  });

  // Wysyłanie wiadomości na chat (tylko dla zalogowanych)
  // socket.on('sendChatMessage', (data: any) => {
  //   // const chatMessage = {
  //   //   userId: socket.data.user.userId,
  //   //   username: socket.data.user.username || socket.data.user.userId,
  //   //   message,
  //   //   timestamp: new Date().toISOString()
  //   // };

  //   console.log(`AUTH HANDLERS -> Received message for stream ${data.streamId}: ${data.message}`);

  //   // Wysyłanie do wszystkich subskrybujących chat (łącznie z publicznymi)
  //   publicNsp.to(`chat:${data.streamId}`).emit('chatMessage', data.message);
  //   // io.of('/auth').to(streamId).emit('chatMessage', chatMessage);
  // });

  // Obsługa błędów połączenia
  socket.on('connectionError', (error: string) => {
    console.error(`Connection error for user ${socket.data.user.userId}: ${error}`);
  });
};