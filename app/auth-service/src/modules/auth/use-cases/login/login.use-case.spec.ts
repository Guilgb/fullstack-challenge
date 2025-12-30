import { UserRepositoryInterface } from '@modules/user/interfaces/user.repository.interface';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@shared/modules/database/entities/user.entity';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../../services/token.service';
import { LoginDto } from './dto/login.dto';
import { LoginUseCase } from './login.use-case';

// Mock bcrypt antes de importar
jest.mock('bcrypt');

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<UserRepositoryInterface>;
  let jwtService: jest.Mocked<JwtService>;
  let tokenService: jest.Mocked<TokenService>;
  let logger: jest.Mocked<WinstonLoggerService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    password: '$2b$10$hashedPassword',
    role: UserRole.USER,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    async hashPassword() {},
  };

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const mockTokenService = {
      storeRefreshToken: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: UserRepositoryInterface,
          useValue: mockUserRepository,
        },
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

    useCase = module.get<LoginUseCase>(LoginUseCase);
    userRepository = module.get(UserRepositoryInterface);
    jwtService = module.get(JwtService);
    tokenService = module.get(TokenService);
    logger = module.get(WinstonLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('deve fazer login com sucesso com credenciais válidas', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const accessToken = 'access-token-123';
      const refreshToken = 'refresh-token-456';

      userRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const result = await useCase.execute(loginDto);

      expect(result).toEqual({
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          username: mockUser.username,
        },
      });

      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(tokenService.storeRefreshToken).toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith(
        `Tentativa de login para: ${loginDto.email}`,
      );
    });

    it('deve lançar UnauthorizedException quando usuário não existe', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      userRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.execute(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(useCase.execute(loginDto)).rejects.toThrow(
        'Credenciais inválidas',
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('deve lançar UnauthorizedException quando senha é inválida', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(useCase.execute(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(useCase.execute(loginDto)).rejects.toThrow(
        'Credenciais inválidas',
      );

      expect(logger.warn).toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('deve logar erro e relançar exceção quando ocorre erro inesperado', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const error = new Error('Database error');
      userRepository.findByEmail.mockRejectedValue(error);

      await expect(useCase.execute(loginDto)).rejects.toThrow(error);

      expect(logger.error).toHaveBeenCalled();
    });

    it('deve gerar tokens com payload correto', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('token');

      await useCase.execute(loginDto);

      const expectedPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };

      expect(jwtService.sign).toHaveBeenNthCalledWith(1, expectedPayload);
      expect(jwtService.sign).toHaveBeenNthCalledWith(2, expectedPayload, {
        expiresIn: '7d',
        secret: expect.any(String),
      });
    });

    it('deve armazenar refresh token com data de expiração correta', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const refreshToken = 'refresh-token-456';

      userRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce(refreshToken);

      const beforeExecution = Date.now();
      await useCase.execute(loginDto);
      const afterExecution = Date.now();

      expect(tokenService.storeRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        refreshToken,
        expect.any(Date),
      );

      const call = tokenService.storeRefreshToken.mock.calls[0];
      const expiresAt = call[2] as Date;

      // Verificar se a data de expiração está aproximadamente 7 dias no futuro
      const expectedMin = beforeExecution + 7 * 24 * 60 * 60 * 1000;
      const expectedMax = afterExecution + 7 * 24 * 60 * 60 * 1000;

      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin);
      expect(expiresAt.getTime()).toBeLessThanOrEqual(expectedMax);
    });
  });
});
