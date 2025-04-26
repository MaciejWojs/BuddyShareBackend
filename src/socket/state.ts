// Stan aplikacji przechowywany w pamięci
export class SocketState {
  // Mapy do przechowywania danych o streamach
  static streamRooms = new Map<string, Set<string>>(); // streamId: Set<userId>
  static liveStreams = new Map<string, number>(); // streamId: viewerCount
  static streamFollowers = new Map<string, Set<string>>(); // streamerId: Set<followerUserId>
  static streamSubscribers = new Map<string, Set<string>>(); // streamerId: Set<subscriberUserId>
  static streamMetadata = new Map<string, {
    title: string,
    description: string,
    streamerName: string,
    category: string
  }>(); // streamId: metadata
}