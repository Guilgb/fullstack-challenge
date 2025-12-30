import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenService],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  afterEach(() => {
    // Limpar todos os tokens após cada teste
    service['refreshTokens'].clear();
  });

  describe('storeRefreshToken', () => {
    it('deve armazenar um refresh token com sucesso', () => {
      const userId = 'user-123';
      const refreshToken = 'token-abc';
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      service.storeRefreshToken(userId, refreshToken, expiresAt);

      const stored = service.getRefreshToken(refreshToken);
      expect(stored).toBeDefined();
      expect(stored?.userId).toBe(userId);
      expect(stored?.refreshToken).toBe(refreshToken);
      expect(stored?.expiresAt).toEqual(expiresAt);
    });
  });

  describe('getRefreshToken', () => {
    it('deve retornar um token válido armazenado', () => {
      const userId = 'user-123';
      const refreshToken = 'token-abc';
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      service.storeRefreshToken(userId, refreshToken, expiresAt);

      const result = service.getRefreshToken(refreshToken);
      expect(result).toBeDefined();
      expect(result?.userId).toBe(userId);
    });

    it('deve retornar null para token inexistente', () => {
      const result = service.getRefreshToken('token-nao-existe');
      expect(result).toBeNull();
    });

    it('deve retornar null e remover token expirado', () => {
      const userId = 'user-123';
      const refreshToken = 'token-abc';
      const expiresAt = new Date(Date.now() - 1000); // Expirado

      service.storeRefreshToken(userId, refreshToken, expiresAt);

      const result = service.getRefreshToken(refreshToken);
      expect(result).toBeNull();

      // Verificar se foi removido
      const secondAttempt = service.getRefreshToken(refreshToken);
      expect(secondAttempt).toBeNull();
    });
  });

  describe('revokeRefreshToken', () => {
    it('deve revogar um token específico', () => {
      const userId = 'user-123';
      const refreshToken = 'token-abc';
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      service.storeRefreshToken(userId, refreshToken, expiresAt);

      const result = service.revokeRefreshToken(refreshToken);
      expect(result).toBe(true);

      const stored = service.getRefreshToken(refreshToken);
      expect(stored).toBeNull();
    });

    it('deve retornar false para token inexistente', () => {
      const result = service.revokeRefreshToken('token-nao-existe');
      expect(result).toBe(false);
    });
  });

  describe('revokeAllUserTokens', () => {
    it('deve revogar todos os tokens de um usuário', () => {
      const userId = 'user-123';
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      service.storeRefreshToken(userId, 'token-1', expiresAt);
      service.storeRefreshToken(userId, 'token-2', expiresAt);
      service.storeRefreshToken('other-user', 'token-3', expiresAt);

      const count = service.revokeAllUserTokens(userId);
      expect(count).toBe(2);

      expect(service.getRefreshToken('token-1')).toBeNull();
      expect(service.getRefreshToken('token-2')).toBeNull();
      expect(service.getRefreshToken('token-3')).toBeDefined();
    });

    it('deve retornar 0 quando usuário não tem tokens', () => {
      const count = service.revokeAllUserTokens('user-sem-tokens');
      expect(count).toBe(0);
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('deve remover tokens expirados', () => {
      const pastDate = new Date(Date.now() - 1000);
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      service.storeRefreshToken('user-1', 'expired-1', pastDate);
      service.storeRefreshToken('user-2', 'expired-2', pastDate);
      service.storeRefreshToken('user-3', 'valid-1', futureDate);

      const count = service.cleanupExpiredTokens();
      expect(count).toBe(2);

      expect(service.getRefreshToken('expired-1')).toBeNull();
      expect(service.getRefreshToken('expired-2')).toBeNull();
      expect(service.getRefreshToken('valid-1')).toBeDefined();
    });

    it('deve retornar 0 quando não há tokens expirados', () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      service.storeRefreshToken('user-1', 'valid-1', futureDate);

      const count = service.cleanupExpiredTokens();
      expect(count).toBe(0);
    });
  });
});
