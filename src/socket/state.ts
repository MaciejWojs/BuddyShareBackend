// Stan aplikacji przechowywany w pamięci
export class SocketState {
  // Istniejące mapy
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
  
  // Nowe struktury dla śledzenia historycznych danych
  static viewerHistory = new Map<string, Array<{timestamp: number, count: number}>>(); // streamId: historia widzów
  static followerHistory = new Map<string, Array<{timestamp: number, count: number}>>(); // streamerId: historia obserwujących
  static subscriberHistory = new Map<string, Array<{timestamp: number, count: number}>>(); // streamerId: historia subskrybentów
  
  // Maksymalna liczba punktów danych w historii (np. ostatnie 30 minut przy 1 punkcie na sekundę)
  static readonly MAX_HISTORY_POINTS = 1800;
  
  // Metody pomocnicze do aktualizacji historii
  static updateViewerHistory(streamId: string, count: number) {
    if (!this.viewerHistory.has(streamId)) {
      this.viewerHistory.set(streamId, []);
    }
    
    const history = this.viewerHistory.get(streamId)!;
    history.push({ timestamp: Date.now(), count });
    
    // Zachowaj tylko MAX_HISTORY_POINTS najnowszych punktów
    if (history.length > this.MAX_HISTORY_POINTS) {
      history.shift();
    }
  }
  
  static updateFollowerHistory(streamerId: string) {
    const count = this.streamFollowers.get(streamerId)?.size || 0;
    
    if (!this.followerHistory.has(streamerId)) {
      this.followerHistory.set(streamerId, []);
    }
    
    const history = this.followerHistory.get(streamerId)!;
    history.push({ timestamp: Date.now(), count });
    
    if (history.length > this.MAX_HISTORY_POINTS) {
      history.shift();
    }
  }
  
  static updateSubscriberHistory(streamerId: string) {
    const count = this.streamSubscribers.get(streamerId)?.size || 0;
    
    if (!this.subscriberHistory.has(streamerId)) {
      this.subscriberHistory.set(streamerId, []);
    }
    
    const history = this.subscriberHistory.get(streamerId)!;
    history.push({ timestamp: Date.now(), count });
    
    if (history.length > this.MAX_HISTORY_POINTS) {
      history.shift();
    }
  }
  
  // Czyszczenie historii po zakończeniu streama
  static clearStreamHistory(streamId: string) {
    this.viewerHistory.delete(streamId);
  }
}