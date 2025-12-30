import { UserModelGuard } from '@modules/auth/decorators/user.model.guard';
import { UserRepositoryInterface } from '@modules/user/interfaces/user.repository.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@shared/modules/database/entities/user.entity';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { ValidateTokenUseCase } from './validate-token.use-case';

describe('ValidateTokenUseCase', () => {
  let useCase: ValidateTokenUseCase;
  let userRepository: jest.Mocked<UserRepositoryInterface>;
  let logger: jest.Mocked<WinstonLoggerService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    role: UserRole.USER,
    password: 'hashed',
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    async hashPassword() {},
  };

  beforeEach(async () => {
    const mockRepository = {
      findByEmail: jest.fn(),
      findByIdOrEmail: jest.fn(),
      existsByIdOrEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAllPaginated: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateTokenUseCase,
        {
          provide: UserRepositoryInterface,
          useValue: mockRepository,
        },
        {
          provide: WinstonLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    useCase = module.get<ValidateTokenUseCase>(ValidateTokenUseCase);
    userRepository = module.get(UserRepositoryInterface);
    logger = module.get(WinstonLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve retornar dados do usuário quando token é válido', async () => {
      const payload: UserModelGuard = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await useCase.execute(payload);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        username: mockUser.username,
      });
      expect(userRepository.findByEmail).toHaveBeenCalledWith(payload.email);
    });

    it('deve retornar null quando usuário não é encontrado', async () => {
      const payload: UserModelGuard = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      };

      userRepository.findByEmail.mockResolvedValue(null);

      const result = await useCase.execute(payload);

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Usuário não encontrado'),
      );
    });

    it('deve retornar null quando usuário está deletado', async () => {
      const payload: UserModelGuard = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      };

      const deletedUser = { ...mockUser, deletedAt: new Date() };
      userRepository.findByEmail.mockResolvedValue(deletedUser);

      const result = await useCase.execute(payload);

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Usuário inativo tentou acessar'),
        'ValidateTokenUseCase',
        expect.objectContaining({
          userId: deletedUser.id,
          email: deletedUser.email,
        }),
      );
    });

    it('deve retornar null e logar erro quando ocorre exceção', async () => {
      const payload: UserModelGuard = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      };

      const error = new Error('Database error');
      userRepository.findByEmail.mockRejectedValue(error);

      const result = await useCase.execute(payload);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Erro na validação do token'),
        error.stack,
        'ValidateTokenUseCase',
        expect.objectContaining({ email: payload.email, userId: payload.id }),
      );
    });
  });
});
