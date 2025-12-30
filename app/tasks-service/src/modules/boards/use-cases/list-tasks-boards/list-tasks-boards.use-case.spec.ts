import { BoardRepositoryInterface } from '@modules/boards/interfaces/board.repository.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { ListTasksBoardsQueryDto } from './dto/list-tasks-boards.dto';
import { ListTasksBoardsUseCase } from './list-tasks-boards.use-case';

describe('ListTasksBoardsUseCase', () => {
  let useCase: ListTasksBoardsUseCase;
  let repository: jest.Mocked<BoardRepositoryInterface>;
  let logger: jest.Mocked<WinstonLoggerService>;

  const mockTasks = [
    {
      id: 'task-1',
      title: 'Task 1',
      description: 'Description 1',
      priority: 'HIGH' as any,
      status: 'TODO' as any,
      deadline: new Date(),
      boardId: 'board-123',
      assignedTo: 'user-1',
      createdBy: 'user-creator',
      createdAt: new Date(),
      updatedAt: new Date(),
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
        ListTasksBoardsUseCase,
        {
          provide: WinstonLoggerService,
          useValue: mockLogger,
        },
        {
          provide: BoardRepositoryInterface,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListTasksBoardsUseCase>(ListTasksBoardsUseCase);
    repository = module.get(BoardRepositoryInterface);
    logger = module.get(WinstonLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve listar tasks de um board', async () => {
      const query: ListTasksBoardsQueryDto = {
        boardId: 'board-123',
        page: 1,
        pageSize: 10,
      };

      repository.findAllTasksByBoardId.mockResolvedValue({
        data: mockTasks,
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      const result = await useCase.execute(query);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(repository.findAllTasksByBoardId).toHaveBeenCalledWith(query);
    });

    it('deve logar antes de listar tasks', async () => {
      const query: ListTasksBoardsQueryDto = {
        boardId: 'board-123',
        page: 1,
        pageSize: 10,
      };

      repository.findAllTasksByBoardId.mockResolvedValue({
        data: mockTasks,
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      await useCase.execute(query);

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Listing tasks for board'),
      );
    });

    it('deve logar resultado com total de tasks', async () => {
      const query: ListTasksBoardsQueryDto = {
        boardId: 'board-123',
        page: 1,
        pageSize: 10,
      };

      repository.findAllTasksByBoardId.mockResolvedValue({
        data: mockTasks,
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      await useCase.execute(query);

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Found 1 tasks'),
      );
    });

    it('deve propagar erro e logar', async () => {
      const query: ListTasksBoardsQueryDto = {
        boardId: 'board-123',
        page: 1,
        pageSize: 10,
      };

      const error = new Error('Database error');
      repository.findAllTasksByBoardId.mockRejectedValue(error);

      await expect(useCase.execute(query)).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
