import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@shared/modules/database/entities/user.entity';
import { AuthController } from './auth.controller';
import { LoginDto, LoginResponseDto } from './use-cases/login/dto/login.dto';
import { LoginUseCase } from './use-cases/login/login.use-case';
import {
  RefreshTokenDto,
  RefreshTokenResponseDto,
} from './use-cases/refresh-token/dto/refresh-token.dto';
import { RefreshTokenUseCase } from './use-cases/refresh-token/refresh-token.use-case';

describe('AuthController', () => {
  let controller: AuthController;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  let refreshTokenUseCase: jest.Mocked<RefreshTokenUseCase>;

  beforeEach(async () => {
    const mockLoginUseCase = {
      execute: jest.fn(),
    };

    const mockRefreshTokenUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: LoginUseCase,
          useValue: mockLoginUseCase,
        },
        {
          provide: RefreshTokenUseCase,
          useValue: mockRefreshTokenUseCase,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    loginUseCase = module.get(LoginUseCase);
    refreshTokenUseCase = module.get(RefreshTokenUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResponse: LoginResponseDto = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-456',
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          username: 'testuser',
          role: UserRole.USER,
        },
      };

      loginUseCase.execute.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResponse);
      expect(loginUseCase.execute).toHaveBeenCalledWith(loginDto);
      expect(loginUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('deve propagar erro do use case', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const error = new Error('Credenciais inválidas');
      loginUseCase.execute.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(error);
      expect(loginUseCase.execute).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('refresh', () => {
    it('deve renovar token com sucesso', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refresh_token: 'refresh-token-123',
      };

      const expectedResponse: RefreshTokenResponseDto = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
      };

      refreshTokenUseCase.execute.mockResolvedValue(expectedResponse);

      const result = await controller.refresh(refreshTokenDto);

      expect(result).toEqual(expectedResponse);
      expect(refreshTokenUseCase.execute).toHaveBeenCalledWith(refreshTokenDto);
      expect(refreshTokenUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('deve propagar erro do use case quando token é inválido', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refresh_token: 'invalid-token',
      };

      const error = new Error('Token inválido ou expirado');
      refreshTokenUseCase.execute.mockRejectedValue(error);

      await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(error);
      expect(refreshTokenUseCase.execute).toHaveBeenCalledWith(refreshTokenDto);
    });
  });
});
