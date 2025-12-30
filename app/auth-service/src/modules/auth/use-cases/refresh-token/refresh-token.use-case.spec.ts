import { TokenService } from '@modules/auth/services/token.service';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshTokenUseCase } from './refresh-token.use-case';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let jwtService: jest.Mocked<JwtService>;
  let tokenService: jest.Mocked<TokenService>;
  let logger: jest.Mocked<WinstonLoggerService>;

  beforeEach(async () => {
    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockTokenService = {
      getRefreshToken: jest.fn(),
      storeRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
      revokeAllUserTokens: jest.fn(),
      cleanupExpiredTokens: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: WinstonLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    jwtService = module.get(JwtService);
    tokenService = module.get(TokenService);
    logger = module.get(WinstonLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve gerar novos tokens quando refresh token é válido', async () => {
      const input: RefreshTokenDto = {
        refresh_token: 'valid-refresh-token',
      };

      const storedToken = {
        userId: 'user-123',
        refreshToken: 'valid-refresh-token',
        expiresAt: new Date(Date.now() + 100000),
      };

      tokenService.getRefreshToken.mockReturnValue(storedToken);
      jwtService.verify.mockReturnValue({ sub: 'user-123' });
      jwtService.sign.mockReturnValueOnce('new-access-token');
      jwtService.sign.mockReturnValueOnce('new-refresh-token');

      const result = await useCase.execute(input);

      expect(result).toEqual({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
      });
      expect(tokenService.storeRefreshToken).toHaveBeenCalled();
      expect(tokenService.revokeRefreshToken).toHaveBeenCalledWith(
        input.refresh_token,
      );
    });

    it('deve lançar UnauthorizedException quando token não está armazenado', async () => {
      const input: RefreshTokenDto = {
        refresh_token: 'invalid-token',
      };

      tokenService.getRefreshToken.mockReturnValue(null);

      await expect(useCase.execute(input)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(logger.warn).toHaveBeenCalled();
    });

    it('deve lançar UnauthorizedException quando token JWT é inválido', async () => {
      const input: RefreshTokenDto = {
        refresh_token: 'expired-token',
      };

      const storedToken = {
        userId: 'user-123',
        refreshToken: 'expired-token',
        expiresAt: new Date(Date.now() + 100000),
      };

      tokenService.getRefreshToken.mockReturnValue(storedToken);
      jwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(useCase.execute(input)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(tokenService.revokeRefreshToken).toHaveBeenCalledWith(
        input.refresh_token,
      );
    });

    it('deve logar sucesso quando refresh é bem-sucedido', async () => {
      const input: RefreshTokenDto = {
        refresh_token: 'valid-token',
      };

      const storedToken = {
        userId: 'user-123',
        refreshToken: 'valid-token',
        expiresAt: new Date(Date.now() + 100000),
      };

      tokenService.getRefreshToken.mockReturnValue(storedToken);
      jwtService.verify.mockReturnValue({ sub: 'user-123' });
      jwtService.sign.mockReturnValueOnce('new-access-token');
      jwtService.sign.mockReturnValueOnce('new-refresh-token');

      await useCase.execute(input);

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Refresh token realizado com sucesso'),
        'RefreshTokenUseCase',
        expect.objectContaining({ userId: storedToken.userId }),
      );
    });
  });
});
