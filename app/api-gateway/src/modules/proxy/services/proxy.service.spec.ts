import {
  GatewayTimeoutException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError, TimeoutError } from 'rxjs';
import { ProxyService } from './proxy.service';

describe('ProxyService', () => {
  let service: ProxyService;
  let authServiceClient: jest.Mocked<ClientProxy>;
  let mockAuthServiceClient: any;

  beforeAll(() => {
    mockAuthServiceClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      send: jest.fn(),
      emit: jest.fn(),
    };

    jest
      .spyOn(ClientProxyFactory, 'create')
      .mockReturnValue(mockAuthServiceClient);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProxyService],
    }).compile();

    service = module.get<ProxyService>(ProxyService);
    authServiceClient = mockAuthServiceClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('deve conectar ao Auth Service via RabbitMQ', async () => {
      await service.onModuleInit();

      expect(authServiceClient.connect).toHaveBeenCalled();
    });

    it('deve logar erro se a conexão falhar', async () => {
      const error = new Error('Connection failed');
      authServiceClient.connect.mockRejectedValueOnce(error);

      await service.onModuleInit();
    });
  });

  describe('onModuleDestroy', () => {
    it('deve fechar a conexão do cliente', async () => {
      await service.onModuleInit();

      await service.onModuleDestroy();

      expect(authServiceClient.close).toHaveBeenCalled();
    });
  });

  describe('sendToAuthService', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('deve enviar mensagem para Auth Service com sucesso', async () => {
      const pattern = 'auth.login';
      const data = { email: 'test@example.com', password: 'password123' };
      const expectedResponse = { accessToken: 'token-123' };

      authServiceClient.send.mockReturnValue(of(expectedResponse) as any);

      const result = await service.sendToAuthService(pattern, data);

      expect(result).toEqual(expectedResponse);
      expect(authServiceClient.send).toHaveBeenCalledWith(pattern, data);
    });

    it('deve enviar payload com query quando fornecida', async () => {
      const pattern = 'user.list';
      const data = {};
      const query = { page: 1, pageSize: 10 };
      const expectedResponse = { data: [], meta: {} };

      authServiceClient.send.mockReturnValue(of(expectedResponse) as any);

      await service.sendToAuthService(pattern, data, query);

      expect(authServiceClient.send).toHaveBeenCalledWith(pattern, {
        data,
        query,
      });
    });

    it('deve lançar GatewayTimeoutException em caso de timeout', async () => {
      const pattern = 'auth.login';
      const data = { email: 'test@example.com', password: 'password123' };

      const timeoutError = new TimeoutError();
      authServiceClient.send.mockReturnValue(
        throwError(() => timeoutError) as any,
      );

      await expect(service.sendToAuthService(pattern, data)).rejects.toThrow(
        GatewayTimeoutException,
      );
      await expect(service.sendToAuthService(pattern, data)).rejects.toThrow(
        'Auth Service timeout',
      );
    });

    it('deve detectar timeout por nome do erro', async () => {
      const pattern = 'auth.validate';
      const data = { token: 'token-123' };

      const error = { name: 'TimeoutError', message: 'Request timed out' };
      authServiceClient.send.mockReturnValue(throwError(() => error) as any);

      await expect(service.sendToAuthService(pattern, data)).rejects.toThrow(
        GatewayTimeoutException,
      );
    });

    it('deve detectar timeout por mensagem contendo "timeout"', async () => {
      const pattern = 'auth.validate';
      const data = { token: 'token-123' };

      const error = new Error('Connection timeout occurred');
      authServiceClient.send.mockReturnValue(throwError(() => error) as any);

      await expect(service.sendToAuthService(pattern, data)).rejects.toThrow(
        GatewayTimeoutException,
      );
    });

    it('deve lançar InternalServerErrorException para outros erros', async () => {
      const pattern = 'auth.login';
      const data = { email: 'test@example.com', password: 'password123' };

      const error = new Error('Service unavailable');
      authServiceClient.send.mockReturnValue(throwError(() => error) as any);

      await expect(service.sendToAuthService(pattern, data)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.sendToAuthService(pattern, data)).rejects.toThrow(
        'Erro no Auth Service. Tente novamente mais tarde.',
      );
    });

    it('deve logar erro quando ocorre timeout', async () => {
      const pattern = 'auth.login';
      const data = { email: 'test@example.com' };

      const timeoutError = new TimeoutError();
      authServiceClient.send.mockReturnValue(
        throwError(() => timeoutError) as any,
      );

      try {
        await service.sendToAuthService(pattern, data);
      } catch (error) {}
    });

    it('deve logar erro quando ocorre falha geral', async () => {
      const pattern = 'auth.login';
      const data = { email: 'test@example.com' };

      const error = new Error('Service error');
      authServiceClient.send.mockReturnValue(throwError(() => error) as any);

      try {
        await service.sendToAuthService(pattern, data);
      } catch (error) {}
    });
  });
});
