import { describe, it, expect } from 'vitest';
import { Request } from 'express';

// Ten plik testowy sprawdza czy rozszerzenia Request z Express działają poprawnie
// Test jest głównie dla TypeScript, więc jest prosty
describe('Express Request extensions', () => {
  it('powinno pozwalać na dodanie własności do obiektu Request', () => {
    const req = {} as Request;
    
    // Testowe dane
    const userData = { userId: 1, username: 'testuser' };
    const userInfoData = { username: 'testuser', email: 'test@example.com' };
    const streamerData = { streamerId: 1, userId: 1 };
    const moderatorData = { moderatorId: 1, userId: 2 };
    
    // Przypisanie danych do req
    req.user = userData;
    req.userInfo = userInfoData;
    req.streamer = streamerData;
    req.moderator = moderatorData;
    req.isModerator = true;
    req.isStreamerModerator = true;
    
    // Sprawdzenie czy dane zostały poprawnie przypisane
    expect(req.user).toEqual(userData);
    expect(req.userInfo).toEqual(userInfoData);
    expect(req.streamer).toEqual(streamerData);
    expect(req.moderator).toEqual(moderatorData);
    expect(req.isModerator).toBe(true);
    expect(req.isStreamerModerator).toBe(true);
  });
});
