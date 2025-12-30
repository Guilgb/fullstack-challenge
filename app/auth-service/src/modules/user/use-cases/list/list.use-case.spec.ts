import { UserRepositoryInterface } from '@modules/user/interfaces/user.repository.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@shared/modules/database/entities/user.entity';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import {
  ListUsersQueryDto,
  OrderDirection,
  UserOrderByFields,
} from './dto/list.dto';
import { ListUsersUseCase } from './list.use-case';

describe('ListUsersUseCase', () => {
  let useCase: ListUsersUseCase;
  let userRepository: jest.Mocked<UserRepositoryInterface>;
  let logger: jest.Mocked<WinstonLoggerService>;

  const mockUsers = [
    {
      id: 'user-1',
      email: 'user1@example.com',
      username: 'user1',
      role: UserRole.USER,
      password: 'hashed',
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      async hashPassword() {},
    },
    {
      id: 'user-2',
      email: 'user2@example.com',
      username: 'user2',
      role: UserRole.ADMIN,
      password: 'hashed',
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      async hashPassword() {},
    },
  ];

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
        ListUsersUseCase,
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

    useCase = module.get<ListUsersUseCase>(ListUsersUseCase);
    userRepository = module.get(UserRepositoryInterface);
    logger = module.get(WinstonLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve listar usuários com paginação padrão', async () => {
      const query: ListUsersQueryDto = {};

      userRepository.findAllPaginated.mockResolvedValue({
        data: mockUsers,
        page: 1,
        pageSize: 10,
        total: 2,
        totalPages: 1,
      });

      const result = await useCase.execute(query);

      expect(result.users).toHaveLength(2);
      expect(result.users[0]).not.toHaveProperty('password');
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.total).toBe(2);
    });

    it('deve listar usuários com paginação customizada', async () => {
      const query: ListUsersQueryDto = {
        page: 2,
        pageSize: 5,
      };

      userRepository.findAllPaginated.mockResolvedValue({
        data: mockUsers,
        page: 2,
        pageSize: 5,
        total: 10,
        totalPages: 2,
      });

      const result = await useCase.execute(query);

      expect(userRepository.findAllPaginated).toHaveBeenCalledWith({
        page: 2,
        pageSize: 5,
        orderBy: undefined,
        orderDirection: undefined,
      });
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(5);
    });

    it('deve listar usuários com ordenação', async () => {
      const query: ListUsersQueryDto = {
        orderBy: UserOrderByFields.EMAIL,
        orderDirection: OrderDirection.ASC,
      };

      userRepository.findAllPaginated.mockResolvedValue({
        data: mockUsers,
        page: 1,
        pageSize: 10,
        total: 2,
        totalPages: 1,
      });

      await useCase.execute(query);

      expect(userRepository.findAllPaginated).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        orderBy: 'email',
        orderDirection: 'ASC',
      });
    });

    it('não deve retornar senhas dos usuários', async () => {
      const query: ListUsersQueryDto = {};

      userRepository.findAllPaginated.mockResolvedValue({
        data: mockUsers,
        page: 1,
        pageSize: 10,
        total: 2,
        totalPages: 1,
      });

      const result = await useCase.execute(query);

      result.users.forEach(user => {
        expect(user).not.toHaveProperty('password');
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('role');
      });
    });

    it('deve logar informações de listagem', async () => {
      const query: ListUsersQueryDto = {};

      userRepository.findAllPaginated.mockResolvedValue({
        data: mockUsers,
        page: 1,
        pageSize: 10,
        total: 2,
        totalPages: 1,
      });

      await useCase.execute(query);

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('listados com sucesso'),
        'ListUsersUseCase',
        expect.objectContaining({
          page: 1,
          pageSize: 10,
          total: 2,
        }),
      );
    });
  });
});
