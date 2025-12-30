import { Test, TestingModule } from '@nestjs/testing';
import { ProxyService } from '../../proxy/services/proxy.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthGatewayController } from './auth-gateway.controller';

describe('AuthGatewayController', () => {
  let controller: AuthGatewayController;
  let proxyService: jest.Mocked<ProxyService>;

  beforeEach(async () => {
    const mockProxyService = {
      sendToAuthService: jest.fn(),
      sendToTasksService: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthGatewayController],
      providers: [
        {
          provide: ProxyService,
          useValue: mockProxyService,
        },
      ],
    }).compile();

    controller = module.get<AuthGatewayController>(AuthGatewayController);
    proxyService = module.get(ProxyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve fazer login através do proxy service', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResponse = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      };

      proxyService.sendToAuthService.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResponse);
      expect(proxyService.sendToAuthService).toHaveBeenCalledWith(
        'auth.login',
        loginDto,
      );
      expect(proxyService.sendToAuthService).toHaveBeenCalledTimes(1);
    });

    it('deve propagar erro do proxy service', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const error = new Error('Credenciais inválidas');
      proxyService.sendToAuthService.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(error);
      expect(proxyService.sendToAuthService).toHaveBeenCalledWith(
        'auth.login',
        loginDto,
      );
    });
  });

  describe('refreshToken', () => {
    it('deve renovar token através do proxy service', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'refresh-token-123',
      };

      const expectedResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      proxyService.sendToAuthService.mockResolvedValue(expectedResponse);

      const result = await controller.refreshToken(refreshTokenDto);

      expect(result).toEqual(expectedResponse);
      expect(proxyService.sendToAuthService).toHaveBeenCalledWith(
        'auth.refresh',
        refreshTokenDto,
      );
      expect(proxyService.sendToAuthService).toHaveBeenCalledTimes(1);
    });

    it('deve propagar erro para token inválido', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'invalid-token',
      };

      const error = new Error('Token de atualização inválido');
      proxyService.sendToAuthService.mockRejectedValue(error);

      await expect(controller.refreshToken(refreshTokenDto)).rejects.toThrow(
        error,
      );
      expect(proxyService.sendToAuthService).toHaveBeenCalledWith(
        'auth.refresh',
        refreshTokenDto,
      );
    });
  });

  describe('validateToken', () => {
    it('deve validar token através do proxy service', async () => {
      const token = 'valid-token-123';

      const expectedResponse = {
        valid: true,
        userId: 'user-123',
        email: 'test@example.com',
      };

      proxyService.sendToAuthService.mockResolvedValue(expectedResponse);

      const result = await controller.validateToken(token);

      expect(result).toEqual(expectedResponse);
      expect(proxyService.sendToAuthService).toHaveBeenCalledWith(
        'auth.validate',
        { token },
      );
      expect(proxyService.sendToAuthService).toHaveBeenCalledTimes(1);
    });

    it('deve propagar erro para token inválido', async () => {
      const token = 'invalid-token';

      const error = new Error('Token inválido');
      proxyService.sendToAuthService.mockRejectedValue(error);

      await expect(controller.validateToken(token)).rejects.toThrow(error);
      expect(proxyService.sendToAuthService).toHaveBeenCalledWith(
        'auth.validate',
        { token },
      );
    });
  });
});
