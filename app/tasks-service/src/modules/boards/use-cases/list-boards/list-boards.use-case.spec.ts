import { BoardRepositoryInterface } from '@modules/boards/interfaces/board.repository.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { ListBoardsQueryDto } from './dto/list-boards.dto';
import { ListBoardsUseCase } from './list-boards.use-case';

describe('ListBoardsUseCase', () => {
  let useCase: ListBoardsUseCase;
  let repository: jest.Mocked<BoardRepositoryInterface>;
  let logger: jest.Mocked<WinstonLoggerService>;

  const mockBoards = [
    {
      id: 'board-1',
      name: 'Board 1',
      description: 'Description 1',
      ownerId: 'owner-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      members: [
        {
          id: 'member-1',
          userId: 'user-1',
          boardId: 'board-1',
          role: 'OWNER' as any,
          joinedAt: new Date(),
          board: null as any,
          user: { username: 'owner' } as any,
        },
      ],
      tasks: [],
    },
    {
      id: 'board-2',
      name: 'Board 2',
      description: 'Description 2',
      ownerId: 'owner-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      members: [],
      tasks: [],
    },
  ];

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdWithMembers: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      addMember: jest.fn(),
      findMember: jest.fn(),
      removeMember: jest.fn(),
      updateMemberRole: jest.fn(),
      isMember: jest.fn(),
      findAllByUserId: jest.fn(),
      findAllTasksByBoardId: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListBoardsUseCase,
        {
          provide: BoardRepositoryInterface,
          useValue: mockRepository,
        },
        {
          provide: WinstonLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    useCase = module.get<ListBoardsUseCase>(ListBoardsUseCase);
    repository = module.get(BoardRepositoryInterface);
    logger = module.get(WinstonLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve listar boards do usuário', async () => {
      const query: ListBoardsQueryDto = {};
      const userId = 'user-1';

      repository.findAllByUserId.mockResolvedValue({
        data: mockBoards,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      const result = await useCase.execute(query, userId);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(repository.findAllByUserId).toHaveBeenCalledWith(userId, query);
    });

    it('deve mapear members corretamente', async () => {
      const query: ListBoardsQueryDto = {};
      const userId = 'user-1';

      repository.findAllByUserId.mockResolvedValue({
        data: mockBoards,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      const result = await useCase.execute(query, userId);

      expect(result.data[0].members).toEqual([
        expect.objectContaining({
          id: 'member-1',
          userId: 'user-1',
          username: 'owner',
          role: 'OWNER',
        }),
      ]);
    });

    it('deve retornar array vazio quando não há members', async () => {
      const query: ListBoardsQueryDto = {};
      const userId = 'user-1';

      repository.findAllByUserId.mockResolvedValue({
        data: mockBoards,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      const result = await useCase.execute(query, userId);

      expect(result.data[1].members).toEqual([]);
    });

    it('deve logar ao listar boards', async () => {
      const query: ListBoardsQueryDto = {};
      const userId = 'user-1';

      repository.findAllByUserId.mockResolvedValue({
        data: mockBoards,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      await useCase.execute(query, userId);

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Listing boards'),
      );
    });

    it('deve passar paginação corretamente', async () => {
      const query: ListBoardsQueryDto = {
        page: 2,
        pageSize: 5,
      };
      const userId = 'user-1';

      repository.findAllByUserId.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        pageSize: 5,
        totalPages: 0,
      });

      await useCase.execute(query, userId);

      expect(repository.findAllByUserId).toHaveBeenCalledWith(userId, query);
    });
  });
});
