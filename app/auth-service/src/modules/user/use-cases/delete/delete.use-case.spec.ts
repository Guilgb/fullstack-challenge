import { UserRepositoryInterface } from '@modules/user/interfaces/user.repository.interface';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { DeleteUserUseCase } from './delete.use-case';
import { DeleteUserParamDto } from './dto/delete.dto';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let userRepository: jest.Mocked<UserRepositoryInterface>;
  let logger: jest.Mocked<WinstonLoggerService>;

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
        DeleteUserUseCase,
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

    useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
    userRepository = module.get(UserRepositoryInterface);
    logger = module.get(WinstonLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve deletar usuário com sucesso por ID', async () => {
      const input: DeleteUserParamDto = { idOrEmail: 'user-123' };

      userRepository.existsByIdOrEmail.mockResolvedValue(true);
      userRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(input);

      expect(userRepository.existsByIdOrEmail).toHaveBeenCalledWith(
        input.idOrEmail,
      );
      expect(userRepository.delete).toHaveBeenCalledWith(input.idOrEmail);
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('deletado com sucesso'),
        'DeleteUserUseCase',
        expect.any(Object),
      );
    });

    it('deve deletar usuário com sucesso por email', async () => {
      const input: DeleteUserParamDto = { idOrEmail: 'test@example.com' };

      userRepository.existsByIdOrEmail.mockResolvedValue(false);
      userRepository.findByEmail.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      } as any);
      userRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(input);

      expect(userRepository.delete).toHaveBeenCalledWith(input.idOrEmail);
    });

    it('deve lançar BadRequestException quando usuário não existe', async () => {
      const input: DeleteUserParamDto = { idOrEmail: 'non-existent' };

      userRepository.existsByIdOrEmail.mockResolvedValue(false);
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.execute(input)).rejects.toThrow(BadRequestException);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('inexistente'),
        'DeleteUserUseCase',
      );
    });

    it('deve propagar erro de banco de dados', async () => {
      const input: DeleteUserParamDto = { idOrEmail: 'user-123' };

      userRepository.existsByIdOrEmail.mockResolvedValue(true);
      userRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(input)).rejects.toThrow();
    });
  });
});
