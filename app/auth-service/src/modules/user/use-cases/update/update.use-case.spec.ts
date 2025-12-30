import { UserRepositoryInterface } from '@modules/user/interfaces/user.repository.interface';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@shared/modules/database/entities/user.entity';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { UpdateUserDto, UpdateUserParamDto } from './dto/user.update.dto';
import { UpdateUserUseCase } from './update.use-case';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
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
        UpdateUserUseCase,
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

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    userRepository = module.get(UserRepositoryInterface);
    logger = module.get(WinstonLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve atualizar usuário com sucesso', async () => {
      const params: UpdateUserParamDto = { idOrEmail: 'user-123' };
      const input: UpdateUserDto = {
        email: 'newemail@example.com',
        role: UserRole.USER,
      };

      const updatedUser = { ...mockUser, ...input };

      userRepository.findByIdOrEmail.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await useCase.execute(params, input);

      expect(result).toEqual({
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
        isEmailVerified: updatedUser.isEmailVerified,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      });
      expect(userRepository.update).toHaveBeenCalledWith(
        params.idOrEmail,
        input,
      );
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      const params: UpdateUserParamDto = { idOrEmail: 'non-existent' };
      const input: UpdateUserDto = { email: 'newemail@example.com' };

      userRepository.findByIdOrEmail.mockResolvedValue(null);

      await expect(useCase.execute(params, input)).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('inexistente'),
        'UpdateUserUseCase',
      );
    });

    it('deve atualizar apenas campos fornecidos', async () => {
      const params: UpdateUserParamDto = { idOrEmail: 'user-123' };
      const input: UpdateUserDto = { role: UserRole.ADMIN };

      userRepository.findByIdOrEmail.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue({ ...mockUser, ...input });

      await useCase.execute(params, input);

      expect(userRepository.update).toHaveBeenCalledWith(
        params.idOrEmail,
        input,
      );
    });

    it('deve logar sucesso na atualização', async () => {
      const params: UpdateUserParamDto = { idOrEmail: 'user-123' };
      const input: UpdateUserDto = { email: 'newemail@example.com' };

      userRepository.findByIdOrEmail.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue({ ...mockUser, ...input });

      await useCase.execute(params, input);

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('atualizado com sucesso'),
        'UpdateUserUseCase',
        expect.objectContaining({
          userIdOrEmail: params.idOrEmail,
        }),
      );
    });

    it('deve propagar erros do repositório', async () => {
      const params: UpdateUserParamDto = { idOrEmail: 'user-123' };
      const input: UpdateUserDto = { password: 'NewPass123!' };

      userRepository.findByIdOrEmail.mockResolvedValue(mockUser);
      userRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(params, input)).rejects.toThrow();
    });
  });
});
