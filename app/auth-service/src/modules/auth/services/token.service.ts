import { Injectable } from '@nestjs/common';

export interface StoredRefreshToken {
  refreshToken: string;
  userId: string;
  expiresAt: Date;
}

@Injectable()
export class TokenService {
  private refreshTokens: Map<string, StoredRefreshToken> = new Map();

  storeRefreshToken(
    userId: string,
    refreshToken: string,
    expiresAt: Date,
  ): void {
    this.refreshTokens.set(refreshToken, {
      refreshToken,
      userId,
      expiresAt,
    });
  }

  getRefreshToken(refreshToken: string): StoredRefreshToken | null {
    const stored = this.refreshTokens.get(refreshToken);

    if (!stored) {
      return null;
    }

    if (new Date() > stored.expiresAt) {
      this.refreshTokens.delete(refreshToken);
      return null;
    }

    return stored;
  }

  revokeRefreshToken(refreshToken: string): boolean {
    return this.refreshTokens.delete(refreshToken);
  }

  revokeAllUserTokens(userId: string): number {
    let count = 0;
    for (const [token, data] of this.refreshTokens.entries()) {
      if (data.userId === userId) {
        this.refreshTokens.delete(token);
        count++;
      }
    }
    return count;
  }

  cleanupExpiredTokens(): number {
    let count = 0;
    const now = new Date();
    for (const [token, data] of this.refreshTokens.entries()) {
      if (now > data.expiresAt) {
        this.refreshTokens.delete(token);
        count++;
      }
    }
    return count;
  }
}
