import { sql } from 'bun';

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
  history: StreamHistory;
  roomMembers: Set<string>;
  chatMessages: Array<ChatMessage>;
  bannedUsers: Set<string>; // NOWE
}

interface StreamerInfo {
  streamerId: string;
  streamerName: string;
  followers: Set<string>;
  subscribers: Set<string>;
  activeStreamId: string | null;
}

export interface ChatMessage {
  chatMessageId: number;
  streamId: number;
  userId: number;
  message: string;
  createdAt: Date;
  isDeleted: boolean;
  username: string;
  avatar: string | null;
  type?: "user" | "system";
  originalMessage?: string; // NOWE
}

export type BanOptions = {
  reason?: string;
  bannedBy?: number;
  bannedUntil?: Date | null;
  isPermanent?: boolean;
}

// Typ historii statystyk streama (do wykresów, frontend, itp.)
export type StreamHistory = {
  viewers: Array<{ timestamp: number; count: number }>;
  subscribers: Array<{ timestamp: number; count: number }>;
  followers: Array<{ timestamp: number; count: number }>;
  chatMessages: Array<{ timestamp: number; count: number }>;
  topChatters: Array<{ timestamp: number; users: Array<{ userId: string; count: number; username: string }> }>;
};

export class SocketState {
  static streams = new Map<string, StreamInfo>();
  static streamers = new Map<string, StreamerInfo>();
  static streamerToStreamMap = new Map<string, string>();

  static readonly CHAT_MESSAGES_LIMIT = 1000;
  static readonly MAX_HISTORY_POINTS = 1800;

  // ---- Stream lifecycle ----
  static async createStream(
    streamId: string,
    streamerId: string,
    title: string,
    description: string,
    category: string,
    streamerName: string,
    isPublic: boolean,
    tags: string[] = [],
  ) {
    console.log('[createStream]', { streamId, streamerId, title, description, category, streamerName, tags, isPublic });
    console.log(`createStream called with streamId: ${streamId}, streamerId: ${streamerId}, title: ${title}`);

    // Zakończ poprzedni aktywny stream tego streamera (jeśli istnieje)
    const prevActiveStreamId = this.streamers.get(streamerId)?.activeStreamId;
    if (prevActiveStreamId && prevActiveStreamId !== streamId) {
      this.endStream(prevActiveStreamId);
      this.clearStreamHistory(prevActiveStreamId);
      this.streams.delete(prevActiveStreamId);
      console.log(`[createStream] Ended previous active stream: ${prevActiveStreamId} for streamer: ${streamerId}`);
    }

    const [subscribers] = await sql`
      SELECT user_id
      FROM subscribers
      WHERE streamer_id = ${streamerId}
    `;

    console.log('[createStream] subscribers ', subscribers);

    let subscribersArr: { user_id: string }[] = [];
    if (Array.isArray(subscribers)) {
      subscribersArr = subscribers;
    } else if (subscribers && typeof subscribers === 'object' && 'user_id' in subscribers) {
      subscribersArr = [subscribers];
    }

    const subscribersMap = subscribersArr.reduce((acc: Set<string>, subscriber: { user_id: string }) => {
      acc.add(subscriber.user_id);
      return acc;
    }, new Set<string>());


    const followers = await sql`
      SELECT f.follower_user_id, us.username
      FROM followers AS f
      join users u on u.id = f.followed_user_id
      join users_info us on us.id = f.follower_user_id
      where u.id = (select user_id from streamers where id = ${streamerId})
    `;

    const followersMap = followers.reduce((acc: Set<string>, follower: { follower_user_id: string }) => {
      acc.add(follower.follower_user_id);
      return acc;
    }, new Set<string>());

    // Pobierz zbanowanych użytkowników dla tego streamera
    const bannedRows = await sql`
      SELECT user_id FROM banned_users_per_streamer WHERE streamer_id = ${streamerId} AND (banned_until IS NULL OR banned_until > NOW())
    `;
    let bannedUsersArr: { user_id: string }[] = [];
    if (Array.isArray(bannedRows)) {
      bannedUsersArr = bannedRows;
    } else if (bannedRows && typeof bannedRows === 'object' && 'user_id' in bannedRows) {
      bannedUsersArr = [bannedRows];
    }
    const bannedUsersSet = bannedUsersArr.reduce((acc: Set<string>, row: { user_id: string }) => {
      acc.add(String(row.user_id));
      return acc;
    }, new Set<string>());

    if (!this.streamers.has(streamerId)) {
      this.streamers.set(streamerId, {
        streamerId,
        streamerName,
        followers: followersMap,
        subscribers: subscribersMap,
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
        followers: [{ timestamp: Date.now(), count: streamer.followers.size }],
        chatMessages: [{ timestamp: Date.now(), count: 0 }], // NOWE
        topChatters: [{ timestamp: Date.now(), users: [] }] // NOWE
      },
      roomMembers: new Set(),
      chatMessages: [],
      bannedUsers: bannedUsersSet // NOWE
    });
  }

  static endStream(streamId: string): void {
    console.log('[endStream]', { streamId });
    console.log(`endStream called with streamId: ${streamId}`);
    const stream = this.streams.get(streamId);
    if (!stream) return;
    stream.metadata.isLive = false;

    // Wyczyść historię, członków pokoju, czat i bany
    stream.history.viewers = [];
    stream.history.subscribers = [];
    stream.history.followers = [];
    stream.history.chatMessages = [];
    stream.history.topChatters = [];
    stream.roomMembers.clear();
    stream.chatMessages = [];
    stream.bannedUsers.clear();

    const sid = stream.metadata.streamerId;
    const streamer = this.streamers.get(sid);
    if (streamer) {
      streamer.activeStreamId = null;
      this.streamerToStreamMap.delete(sid);
    }
    // Usuwanie streamu z mapy, aby nie był brany pod uwagę przy emisji statystyk
    this.streams.delete(streamId);
    console.log(`[endStream] Stream ${streamId} removed from state.`);
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
    stream.metadata.tags = tags ? tags : null;
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
    // console.log('[removeViewer]', { streamId, userId });
    // console.log(`removeViewer called with streamId: ${streamId}, userId: ${userId}`);
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
    if (!this.streamers.has(streamerId)) {
      this.streamers.set(streamerId, { streamerId, streamerName: '', followers: new Set(), subscribers: new Set(), activeStreamId: null });
    }
    const st = this.streamers.get(streamerId)!;
    st.followers.add(userId);
    const count = st.followers.size;

    // Synchronizuj followers i historię we wszystkich streamach tego streamera
    for (const [streamId, stream] of this.streams.entries()) {
      if (stream.metadata.streamerId === streamerId) {
        stream.followers = count;
        this.addHistoryPoint(streamId, 'followers', count);
      }
    }
    console.log(`addFollower: ${streamerId} now has ${count} followers`);
    return count;
  }

  static removeFollower(streamerId: string, userId: string): number {
    console.log('[removeFollower]', { streamerId, userId });
    const st = this.streamers.get(streamerId);
    if (!st) return 0;
    st.followers.delete(userId);
    const count = st.followers.size;

    // Synchronizuj followers i historię we wszystkich streamach tego streamera
    for (const [streamId, stream] of this.streams.entries()) {
      if (stream.metadata.streamerId === streamerId) {
        stream.followers = count;
        this.addHistoryPoint(streamId, 'followers', count);
      }
    }
    console.log(`removeFollower: ${streamerId} now has ${count} followers`);
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

  private static addChatHistoryPoint(streamId: string) {
    const stream = this.streams.get(streamId);
    if (!stream) return;

    // Liczba wiadomości w czacie (tylko nieusunięte)
    const count = stream.chatMessages.filter(msg => !msg.isDeleted).length;
    stream.history.chatMessages.push({ timestamp: Date.now(), count });
    while (stream.history.chatMessages.length > this.MAX_HISTORY_POINTS) stream.history.chatMessages.shift();

    // Top 5 aktywnych użytkowników
    const userMsgCount: Record<string, { count: number; username: string }> = {};
    for (const msg of stream.chatMessages) {
      if (!msg.isDeleted) {
        if (!userMsgCount[msg.userId]) {
          userMsgCount[msg.userId] = { count: 0, username: msg.username };
        }
        userMsgCount[msg.userId].count += 1;
      }
    }
    const topUsers = Object.entries(userMsgCount)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([userId, data]) => ({ userId, count: data.count, username: data.username }));

    stream.history.topChatters.push({ timestamp: Date.now(), users: topUsers });
    while (stream.history.topChatters.length > this.MAX_HISTORY_POINTS) stream.history.topChatters.shift();
  }

  static updateHistory(streamId: string) {
    // console.log('[updateHistory]', { streamId });
    const stream = this.streams.get(streamId);
    if (!stream) return;
    const viewers = stream.viewers;
    const subscribers = stream.subscribers;
    const followers = stream.followers;
    this.addHistoryPoint(streamId, 'viewers', viewers);
    this.addHistoryPoint(streamId, 'subscribers', subscribers);
    this.addHistoryPoint(streamId, 'followers', followers);
    this.addChatHistoryPoint(streamId);
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

  static clearStreamHistory(streamId: string, type?: 'viewers' | 'followers' | 'subscribers' | 'chatMessages' | 'topChatters') {
    const stream = this.streams.get(streamId);
    if (!stream) return;
    if (type) stream.history[type] = [];
    else {
      stream.history.viewers = [];
      stream.history.followers = [];
      stream.history.subscribers = [];
      stream.history.chatMessages = [];
      stream.history.topChatters = [];
    }
  }

  static async addChatMessage(streamId: number, userId: number, message: string) {
    const stream = this.streams.get(String(streamId));
    if (!stream) return;
    if (!stream.chatMessages) stream.chatMessages = [];
    // Sprawdź czy użytkownik jest zbanowany
    if (stream.bannedUsers && stream.bannedUsers.has(String(userId))) {
      // Możesz tu dodać logowanie lub obsługę powiadomienia
      return false;
    }
    let chatMessageId = 0;
    let createdAt = new Date();
    let username = 'Anonymous';
    let avatar: string | null = null;
    await sql.begin(async (tx) => {
      const result = await tx`
        INSERT INTO chat_messages (stream_id, user_id, message)
        VALUES (${streamId}, ${userId}, ${message})
        RETURNING id, created_at
      `;
      const userResult = await tx`
        SELECT username, profile_picture
        FROM users_info
        WHERE id = ${userId}
      `;
      if (Array.isArray(result) && result.length > 0) {
        chatMessageId = result[0].id;
        createdAt = result[0].created_at;
      } else if (result && typeof result === 'object') {
        chatMessageId = result.id;
        createdAt = result.created_at;
      }
      if (userResult) {
        if (Array.isArray(userResult)) {
          username = userResult[0]?.username || 'Anonymous';
          avatar = userResult[0]?.avatar || null;
        } else {
          username = userResult.username || 'Anonymous';
          avatar = userResult.avatar || null;
        }
      }
    });

    stream.chatMessages.push({
      chatMessageId,
      streamId,
      userId,
      message,
      createdAt,
      isDeleted: false,
      username,
      avatar,
      type: 'user'
    });
    if (stream.chatMessages.length > this.CHAT_MESSAGES_LIMIT) stream.chatMessages.shift();
    return true;
  }

  static getChatHistory(streamId: number): Array<ChatMessage> {
    const stream = this.streams.get(String(streamId));
    return stream?.chatMessages || [];
  }

  static async deleteChatMessage(message: ChatMessage) {
    const stream = this.streams.get(String(message.streamId));
    if (!stream) return;
    const chatMessage = stream.chatMessages.find((msg) => msg.chatMessageId === message.chatMessageId);
    const idx = stream.chatMessages.findIndex((msg) => msg.chatMessageId === message.chatMessageId);
    if (chatMessage && idx !== -1) {
      chatMessage.originalMessage = chatMessage.message; // zapisz starą treść
      chatMessage.isDeleted = true;
      chatMessage.message = 'This message has been deleted';
      chatMessage.type = 'system';
      stream.chatMessages[idx] = chatMessage;
      await sql.begin(async (tx) => {
        await tx`
          UPDATE chat_messages
          SET is_deleted = true, message = 'This message has been deleted'
          WHERE id = ${chatMessage.chatMessageId}
        `;
      });
      return chatMessage;
    }
  }

  static async banUser(userId: number, streamId: number, options?: BanOptions) {
    let success = true;
    const reason = options?.reason || "Unknown reason";
    const bannedBy = options?.bannedBy || null;
    const bannedUntil = options?.bannedUntil || null;
    const isPermanent = options?.isPermanent !== undefined ? options.isPermanent : true;
    const streamerId = this.getStreamerId(String(streamId));
    if (!streamerId) {
      console.error(`Streamer ID not found for stream ID: ${streamId}`);
      return;
    }

    // Zabezpieczenie: jeśli użytkownik już jest zbanowany w state, nie wykonuj ponownie bana
    const stream = this.streams.get(String(streamId));
    if (stream && stream.bannedUsers.has(String(userId))) {
      return false;
    }

    try {
      await sql.begin(async (tx) => {
        await tx`
          INSERT INTO banned_users_per_streamer (user_id, streamer_id, reason, banned_by, banned_since, banned_until, is_permanent)
          VALUES (
            ${userId},
            ${streamerId},
            ${reason},
            ${bannedBy},
            NOW(),
            ${bannedUntil},
            ${isPermanent}
          )
        `;
      });
      // Dodaj użytkownika do listy zbanowanych w state
      if (stream) {
        stream.bannedUsers.add(String(userId));
      }
    }
    catch (e) {
      console.error('Error banning user:', e);
      success = false;
    }
    return success;
  }

  static getStreamerId(streamId: string): string | null {
    const stream = this.streams.get(streamId);
    if (!stream) return null;
    return stream.metadata.streamerId;
  }
}