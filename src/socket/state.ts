import { Socket } from 'socket.io';

// Interfejs dla scentralizowanych informacji o streamie
interface StreamInfo {
  viewers: number;
  subscribers: number;
  followers: number;
  metadata: {
    streamId: string;
    streamerId: string;
    streamerName: string;
    title: string;
    description: string;
    category: string;
    thumbnail?: string | null;
    tags?: string[] | null;
    isLive: boolean;
    isPublic: boolean;
  };
  history: {
    viewers: Array<{ timestamp: number; count: number }>;
    subscribers: Array<{ timestamp: number; count: number }>;
    followers: Array<{ timestamp: number; count: number }>;
  };
  roomMembers: Set<string>;
}

interface StreamerInfo {
  streamerId: string;
  streamerName: string;
  followers: Set<string>;
  subscribers: Set<string>;
  activeStreamId: string | null;
}

export class SocketState {
  static streams = new Map<string, StreamInfo>();
  static streamers = new Map<string, StreamerInfo>();
  static streamerToStreamMap = new Map<string, string>();

  static readonly MAX_HISTORY_POINTS = 1800;

  // ---- Stream lifecycle ----
  static createStream(
    streamId: string,
    streamerId: string,
    title: string,
    description: string,
    category: string,
    streamerName: string,
    isPublic: boolean,
    tags: string[] = [],
  ): void {
    console.log('[createStream]', { streamId, streamerId, title, description, category, streamerName, tags, isPublic });
    console.log(`createStream called with streamId: ${streamId}, streamerId: ${streamerId}, title: ${title}`);
    if (!this.streamers.has(streamerId)) {
      this.streamers.set(streamerId, {
        streamerId,
        streamerName,
        followers: new Set(),
        subscribers: new Set(),
        activeStreamId: null
      });
    } else {
      this.streamers.get(streamerId)!.streamerName = streamerName;
    }

    const streamer = this.streamers.get(streamerId)!;
    streamer.activeStreamId = streamId;
    this.streamerToStreamMap.set(streamerId, streamId);

    this.streams.set(streamId, {
      viewers: 0,
      subscribers: streamer.subscribers.size,
      followers: streamer.followers.size,
      metadata: {
        streamId,
        streamerId,
        streamerName,
        title,
        description,
        category,
        tags: tags.length ? tags : null,
        thumbnail: null,
        isLive: true,
        isPublic: isPublic
      },
      history: {
        viewers: [],
        subscribers: [{ timestamp: Date.now(), count: streamer.subscribers.size }],
        followers: [{ timestamp: Date.now(), count: streamer.followers.size }]
      },
      roomMembers: new Set()
    });
  }

  static endStream(streamId: string): void {
    console.log('[endStream]', { streamId });
    console.log(`endStream called with streamId: ${streamId}`);
    const stream = this.streams.get(streamId);
    if (!stream) return;
    stream.metadata.isLive = false;

    const sid = stream.metadata.streamerId;
    const streamer = this.streamers.get(sid);
    if (streamer) {
      streamer.activeStreamId = null;
      this.streamerToStreamMap.delete(sid);
    }
  }

  static patchStream(
    streamId: string,
    title: string,
    description: string,
    category: string,
    tags: string[] = [],
    isPublic: boolean,
    thumbnail?: string | null
  ): void {
    console.log('[patchStream]', { streamId, title, description, category, tags, thumbnail, isPublic });
    console.log(`patchStream called with streamId: ${streamId}, title: ${title}`);
    const stream = this.streams.get(streamId);
    if (!stream) return;
    stream.metadata.title = title;
    stream.metadata.description = description;
    stream.metadata.category = category;
    stream.metadata.tags = tags? tags : null;
    stream.metadata.thumbnail = thumbnail || null;
    stream.metadata.isPublic = isPublic;

    this.updateHistory(streamId);
    console.log(`Stream ${streamId} patched:`, stream.metadata);
  }

  // ---- Viewer operations ----
  static addViewer(streamId: string, userId: string): number {
    console.log('[addViewer]', { streamId, userId });
    console.log(`addViewer called with streamId: ${streamId}, userId: ${userId}`);
    const stream = this.streams.get(streamId);
    if (!stream) return 0;
    stream.roomMembers.add(userId);
    stream.viewers = stream.roomMembers.size;
    this.addHistoryPoint(streamId, 'viewers', stream.viewers);
    return stream.viewers;
  }

  static removeViewer(streamId: string, userId: string): number {
    console.log('[removeViewer]', { streamId, userId });
    console.log(`removeViewer called with streamId: ${streamId}, userId: ${userId}`);
    const stream = this.streams.get(streamId);
    if (!stream) return 0;
    stream.roomMembers.delete(userId);
    stream.viewers = stream.roomMembers.size;
    this.addHistoryPoint(streamId, 'viewers', stream.viewers);
    return stream.viewers;
  }

  // ---- Follower operations ----
  static addFollower(streamerId: string, userId: string): number {
    console.log('[addFollower]', { streamerId, userId });
    console.log(`addFollower called with streamerId: ${streamerId}, userId: ${userId}`);
    if (!this.streamers.has(streamerId)) {
      this.streamers.set(streamerId, { streamerId, streamerName: '', followers: new Set(), subscribers: new Set(), activeStreamId: null });
    }
    const st = this.streamers.get(streamerId)!;
    st.followers.add(userId);
    const count = st.followers.size;
    const sid = st.activeStreamId;
    if (sid) {
      const stream = this.streams.get(sid);
      if (stream) {
        stream.followers = count;
        this.addHistoryPoint(sid, 'followers', count);
      }
    }
    // Synchronizacja liczby obserwujących w streamie (jeśli istnieje)
    for (const [streamId, stream] of this.streams.entries()) {
      if (stream.metadata.streamerId === streamerId) {
        stream.followers = count;
      }
    }
    console.log(`addFollower: ${streamerId} now has ${count} followers`);
    return count;
  }

  static removeFollower(streamerId: string, userId: string): number {
    console.log('[removeFollower]', { streamerId, userId });
    console.log(`removeFollower called with streamerId: ${streamerId}, userId: ${userId}`);
    const st = this.streamers.get(streamerId);
    if (!st) return 0;
    st.followers.delete(userId);
    const count = st.followers.size;
    const sid = st.activeStreamId;
    if (sid) {
      const stream = this.streams.get(sid);
      if (stream) {
        stream.followers = count;
        this.addHistoryPoint(sid, 'followers', count);
      }
    }
    // Synchronizacja liczby obserwujących w streamie (jeśli istnieje)
    for (const [streamId, stream] of this.streams.entries()) {
      if (stream.metadata.streamerId === streamerId) {
        stream.followers = count;
      }
    }
    return count;
  }

  // ---- Subscriber operations ----
  static addSubscriber(streamerId: string, userId: string): number {
    if (!this.streamers.has(streamerId)) {
      this.streamers.set(streamerId, { streamerId, streamerName: '', followers: new Set(), subscribers: new Set(), activeStreamId: null });
    }
    const st = this.streamers.get(streamerId)!;
    st.subscribers.add(userId);
    const count = st.subscribers.size;
    const sid = st.activeStreamId;
    if (sid) {
      const stream = this.streams.get(sid);
      if (stream) {
        stream.subscribers = count;
        this.addHistoryPoint(sid, 'subscribers', count);
      }
    }
    // Synchronizacja liczby subskrybentów w streamie (jeśli istnieje)
    for (const [streamId, stream] of this.streams.entries()) {
      if (stream.metadata.streamerId === String(streamerId)) {
        stream.subscribers = count;
        this.addHistoryPoint(streamId, 'subscribers', count);
      }
    }
    return count;
  }

  static removeSubscriber(streamerId: string, userId: string): number {
    const st = this.streamers.get(streamerId);
    if (!st) return 0;
    st.subscribers.delete(userId);
    const count = st.subscribers.size;
    const sid = st.activeStreamId;
    if (sid) {
      const stream = this.streams.get(sid);
      if (stream) {
        stream.subscribers = count;
        this.addHistoryPoint(sid, 'subscribers', count);
      }
    }
    // Synchronizacja liczby subskrybentów w streamie (jeśli istnieje)
    for (const [streamId, stream] of this.streams.entries()) {
      if (stream.metadata.streamerId === String(streamerId)) {
        stream.subscribers = count;
        this.addHistoryPoint(streamId, 'subscribers', count);
        console.log(`[addSubscriber][sync] streamId: ${streamId}, new count: ${count}`);
      }
    }
    console.log(`removeSubscriber: ${streamerId} now has ${count} subscribers`)
    return count;
  }

  // ---- History helper ----
  private static addHistoryPoint(
    streamId: string,
    type: 'viewers' | 'followers' | 'subscribers',
    count: number
  ) {
    const stream = this.streams.get(streamId);
    if (!stream) return;
    const arr = stream.history[type];
    arr.push({ timestamp: Date.now(), count });
    while (arr.length > this.MAX_HISTORY_POINTS) arr.shift();
  }

  static updateHistory(streamId: string) {
    console.log('[updateHistory]', { streamId });
    const stream = this.streams.get(streamId);
    if (!stream) return;
    const viewers = stream.viewers;
    const subscribers = stream.subscribers;
    const followers = stream.followers;
    this.addHistoryPoint(streamId, 'viewers', viewers);
    this.addHistoryPoint(streamId, 'subscribers', subscribers);
    this.addHistoryPoint(streamId, 'followers', followers);
  }

  // ---- Convenience for stats emission ----
  static updateViewerHistory(streamId: string, viewers: number) {
    this.addHistoryPoint(streamId, 'viewers', viewers);
  }
  static updateFollowerHistory(streamId: string) {
    const cnt = this.streams.get(streamId)?.followers || 0;
    this.addHistoryPoint(streamId, 'followers', cnt);
  }
  static updateSubscriberHistory(streamId: string) {
    const cnt = this.streams.get(streamId)?.subscribers || 0;
    this.addHistoryPoint(streamId, 'subscribers', cnt);
  }

  static getSubscribersForStream(streamId: string): number {
    return this.streams.get(streamId)?.subscribers || 0;
  }
  static getFollowersForStream(streamId: string): number {
    return this.streams.get(streamId)?.followers || 0;
  }

  static getStreamInfo(streamId: string) {
    return this.streams.get(streamId);
  }
  static isStreamActive(streamId: string): boolean {
    return this.streams.get(streamId)?.metadata.isLive || false;
  }
  static getActiveStreamForStreamer(streamerId: string): string | null {
    return this.streamers.get(streamerId)?.activeStreamId || null;
  }

  static clearStreamHistory(streamId: string, type?: 'viewers' | 'followers' | 'subscribers') {
    const stream = this.streams.get(streamId);
    if (!stream) return;
    if (type) stream.history[type] = [];
    else {
      stream.history.viewers = [];
      stream.history.followers = [];
      stream.history.subscribers = [];
    }
  }
}