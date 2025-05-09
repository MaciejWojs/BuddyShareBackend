import { Server, Socket } from 'socket.io';
import { SocketState } from '../state';

export const handlePublicEvents = (socket: Socket, io: Server) => {
  // Pobieranie listy aktywnych transmisji (publiczne)
  socket.on('getLiveStreams', () => {
    const liveStreamsList = Array.from(SocketState.liveStreams.entries())
      .map(([streamId, viewerCount]) => ({
        streamId,
        viewerCount,
        ...SocketState.streamMetadata.get(streamId)
      }));

    socket.emit('liveStreamsList', liveStreamsList);
  });

  // socket.on('sendChatMessage', (data) => {
  //   console.log(`Received message for stream ${data.streamId}: ${data.message}`);


  //   io.of('/public').to(streamId).emit('viewerUpdate', SocketState.liveStreams.get(streamId));

  // });

  // zakładam, że masz coś takiego:
  // namespace „public”

  // dołączanie do pokoju czatowego
  socket.on("joinChatRoom", (streamId: string) => {
    if (!streamId) {
      console.error("Invalid streamId:", streamId);
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
    socket.join(streamId);

    console.log(`Someone joined stream ${streamId}`);
    if (statsOnly) {
      return;
    }
    // Aktualizuj licznik widzów
    const viewerCount = SocketState.liveStreams.get(streamId) || 0;
    SocketState.liveStreams.set(streamId, viewerCount + 1);
    
    // Aktualizuj historię widzów
    SocketState.updateViewerHistory(streamId, viewerCount + 1);

    // Powiadom wszystkich o nowym widzu
    io.of('/public').to(streamId).emit('viewerUpdate', SocketState.liveStreams.get(streamId));
    console.log(`updated viewer count for stream ${streamId}: ${SocketState.liveStreams.get(streamId)}`);
  });

  // Opuszczanie transmisji (publiczne)
  socket.on('leaveStream', (streamId: string) => {
    socket.leave(streamId);

    const viewerCount = (SocketState.liveStreams.get(streamId) || 1) - 1;
    SocketState.liveStreams.set(streamId, Math.max(0, viewerCount));
    
    // Aktualizuj historię widzów
    SocketState.updateViewerHistory(streamId, Math.max(0, viewerCount));

    io.of('/public').to(streamId).emit('viewerUpdate', viewerCount);
  });

  // Pobieranie liczby obserwujących (publiczne)
  socket.on('getFollowerCount', (streamerId: string) => {
    socket.emit('followerCountUpdate', {
      streamerId,
      count: SocketState.streamFollowers.get(streamerId)?.size || 0
    });
  });

  // Odbieranie wiadomości z chatu (publiczne)
  socket.on('subscribeToChat', (streamId: string) => {
    socket.join(`chat:${streamId}`);
  });

  socket.on('unsubscribeFromChat', (streamId: string) => {
    socket.leave(`chat:${streamId}`);
  });
};