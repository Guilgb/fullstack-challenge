import { UserRepositoryInterface } from '@modules/user/interfaces/user.repository.interface';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@shared/modules/database/entities/user.entity';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { GetUserParamDto } from './dto/get.dto';
import { GetUserUseCase } from './get.use-case';

describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;
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
        GetUserUseCase,
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

    useCase = module.get<GetUserUseCase>(GetUserUseCase);
    userRepository = module.get(UserRepositoryInterface);
    logger = module.get(WinstonLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve retornar usuário quando encontrado por ID', async () => {
      const input: GetUserParamDto = { idOrEmail: 'user-123' };

      userRepository.findByIdOrEmail.mockResolvedValue(mockUser);

      const result = await useCase.execute(input);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        role: mockUser.role,
        isEmailVerified: mockUser.isEmailVerified,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(userRepository.findByIdOrEmail).toHaveBeenCalledWith(
        input.idOrEmail,
      );
    });

    it('deve retornar usuário quando encontrado por email', async () => {
      const input: GetUserParamDto = { idOrEmail: 'test@example.com' };

      userRepository.findByIdOrEmail.mockResolvedValue(mockUser);

      const result = await useCase.execute(input);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        role: mockUser.role,
        isEmailVerified: mockUser.isEmailVerified,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('deve lançar BadRequestException quando usuário não é encontrado', async () => {
      const input: GetUserParamDto = { idOrEmail: 'non-existent' };

      userRepository.findByIdOrEmail.mockResolvedValue(null);

      await expect(useCase.execute(input)).rejects.toThrow(BadRequestException);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('não encontrado'),
      );
    });

    it('deve logar quando usuário é encontrado', async () => {
      const input: GetUserParamDto = { idOrEmail: 'user-123' };

      userRepository.findByIdOrEmail.mockResolvedValue(mockUser);

      await useCase.execute(input);

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Buscando usuário'),
      );
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('encontrado com sucesso'),
      );
    });
  });
});
