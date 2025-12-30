import { TaskRepositoryInterface } from '@modules/tasks/interfaces/task.repository.interface';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import {
  ListTasksQueryDto,
  OrderDirection,
  TasksOrderByFields,
} from './dto/list.dto';
import { ListTasksUseCase } from './list.use-case';

describe('ListTasksUseCase', () => {
  let useCase: ListTasksUseCase;
  let repository: jest.Mocked<TaskRepositoryInterface>;
  let logger: jest.Mocked<WinstonLoggerService>;

  const mockTasks = [
    {
      id: 'task-1',
      title: 'Task 1',
      description: 'Description 1',
      priority: 'HIGH' as any,
      status: 'TODO' as any,
      deadline: new Date('2025-12-31'),
      boardId: 'board-123',
      assignedTo: 'user-1',
      createdBy: 'user-creator',
      createdAt: new Date(),
      updatedAt: new Date(),
      board: null,
    },
    {
      id: 'task-2',
      title: 'Task 2',
      description: 'Description 2',
      priority: 'LOW' as any,
      status: 'DONE' as any,
      deadline: new Date('2025-11-30'),
      boardId: 'board-123',
      assignedTo: 'user-2',
      createdBy: 'user-creator',
      createdAt: new Date(),
      updatedAt: new Date(),
      board: null,
    },
  ];

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
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
        ListTasksUseCase,
        {
          provide: TaskRepositoryInterface,
          useValue: mockRepository,
        },
        {
          provide: WinstonLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    useCase = module.get<ListTasksUseCase>(ListTasksUseCase);
    repository = module.get(TaskRepositoryInterface);
    logger = module.get(WinstonLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve listar tasks com paginação padrão', async () => {
      const query: ListTasksQueryDto = {};

      repository.findAllPaginated.mockResolvedValue({
        data: mockTasks,
        page: 1,
        pageSize: 10,
        total: 2,
        totalPages: 1,
      });

      const result = await useCase.execute(query);

      expect(result.data).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.total).toBe(2);
    });

    it('deve listar tasks com paginação customizada', async () => {
      const query: ListTasksQueryDto = {
        page: 2,
        pageSize: 5,
      };

      repository.findAllPaginated.mockResolvedValue({
        data: mockTasks,
        page: 2,
        pageSize: 5,
        total: 10,
        totalPages: 2,
      });

      const result = await useCase.execute(query);

      expect(repository.findAllPaginated).toHaveBeenCalledWith({
        page: 2,
        pageSize: 5,
        orderBy: undefined,
        orderDirection: undefined,
      });
    });

    it('deve listar tasks com ordenação', async () => {
      const query: ListTasksQueryDto = {
        orderBy: TasksOrderByFields.TITLE,
        orderDirection: OrderDirection.DESC,
      };

      repository.findAllPaginated.mockResolvedValue({
        data: mockTasks,
        page: 1,
        pageSize: 10,
        total: 2,
        totalPages: 1,
      });

      await useCase.execute(query);

      expect(repository.findAllPaginated).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        orderBy: TasksOrderByFields.TITLE,
        orderDirection: OrderDirection.DESC,
      });
    });

    it('deve retornar apenas campos permitidos', async () => {
      const query: ListTasksQueryDto = {};

      repository.findAllPaginated.mockResolvedValue({
        data: mockTasks,
        page: 1,
        pageSize: 10,
        total: 2,
        totalPages: 1,
      });

      const result = await useCase.execute(query);

      result.data.forEach(task => {
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('title');
        expect(task).toHaveProperty('description');
        expect(task).toHaveProperty('priority');
        expect(task).toHaveProperty('deadline');
        expect(task).not.toHaveProperty('board');
      });
    });

    it('deve logar listagem com sucesso', async () => {
      const query: ListTasksQueryDto = {};

      repository.findAllPaginated.mockResolvedValue({
        data: mockTasks,
        page: 1,
        pageSize: 10,
        total: 2,
        totalPages: 1,
      });

      await useCase.execute(query);

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('listadas com sucesso'),
        'ListTasksUseCase',
        expect.objectContaining({
          page: 1,
          pageSize: 10,
          total: 2,
        }),
      );
    });

    it('deve lançar BadRequestException em caso de erro', async () => {
      const query: ListTasksQueryDto = {};

      repository.findAllPaginated.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(useCase.execute(query)).rejects.toThrow(BadRequestException);
    });
  });
});
