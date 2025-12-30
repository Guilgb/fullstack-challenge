import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@shared/modules/database/entities/user.entity';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { UserRepositoryInterface } from '../../interfaces/user.repository.interface';
import { CreateUserUseCase } from './create.use-case';
import { CreateUserDto } from './dto/user.create.dto';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<UserRepositoryInterface>;
  let logger: jest.Mocked<WinstonLoggerService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    password: '$2b$10$hashedPassword',
    role: UserRole.USER,
    isEmailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    async hashPassword() {},
  };

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: UserRepositoryInterface,
          useValue: mockUserRepository,
        },
        {
          provide: WinstonLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = module.get(UserRepositoryInterface);
    logger = module.get(WinstonLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve criar um usuário com sucesso', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);

      const result = await useCase.execute(createUserDto);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        role: mockUser.role,
        isEmailVerified: mockUser.isEmailVerified,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(userRepository.create).toHaveBeenCalledWith(
        createUserDto,
        expect.any(String),
      );
      expect(logger.log).toHaveBeenCalled();
    });

    it('deve lançar ConflictException quando email já existe', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        username: 'testuser',
        password: 'password123',
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        'Email já está em uso',
      );

      expect(logger.warn).toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('deve tratar erro de constraint de email do banco de dados', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      userRepository.findByEmail.mockResolvedValue(null);

      const dbError: any = new Error('Duplicate key');
      dbError.code = '23505';
      dbError.constraint = 'users_email_key';

      userRepository.create.mockRejectedValue(dbError);

      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        'Email já está em uso',
      );
    });

    it('deve lançar BadRequestException para erros gerais', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        'Falha ao criar usuário',
      );

      expect(logger.error).toHaveBeenCalled();
    });

    it('deve propagar ConflictException existente', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      const conflictError = new ConflictException('Custom conflict');
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockRejectedValue(conflictError);

      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        conflictError,
      );
    });

    it('deve gerar um UUID para o novo usuário', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);

      await useCase.execute(createUserDto);

      expect(userRepository.create).toHaveBeenCalledWith(
        createUserDto,
        expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ),
      );
    });
  });
});
