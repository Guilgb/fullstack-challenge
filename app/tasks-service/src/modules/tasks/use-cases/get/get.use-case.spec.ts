import { TaskRepositoryInterface } from '@modules/tasks/interfaces/task.repository.interface';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { GetTaskParamsDto } from './dto/get.dto';
import { GetTaskUseCase } from './get.use-case';

describe('GetTaskUseCase', () => {
  let useCase: GetTaskUseCase;
  let repository: jest.Mocked<TaskRepositoryInterface>;
  let logger: jest.Mocked<WinstonLoggerService>;

  const mockTask = {
    id: 'task-123',
    title: 'Test Task',
    description: 'Test Description',
    priority: 'HIGH' as any,
    status: 'TODO' as any,
    deadline: new Date('2025-12-31'),
    boardId: 'board-123',
    assignedTo: 'user-assigned',
    createdBy: 'user-creator',
    createdAt: new Date(),
    updatedAt: new Date(),
    board: null,
  };

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
        GetTaskUseCase,
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

    useCase = module.get<GetTaskUseCase>(GetTaskUseCase);
    repository = module.get(TaskRepositoryInterface);
    logger = module.get(WinstonLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve retornar task quando encontrada', async () => {
      const params: GetTaskParamsDto = { id: 'task-123' };

      repository.findById.mockResolvedValue(mockTask);

      const result = await useCase.execute(params);

      expect(result).toEqual({
        id: mockTask.id,
        title: mockTask.title,
        description: mockTask.description,
        priority: mockTask.priority,
        deadline: mockTask.deadline,
        createdAt: mockTask.createdAt,
        updatedAt: mockTask.updatedAt,
      });
      expect(repository.findById).toHaveBeenCalledWith(params.id);
    });

    it('deve lançar BadRequestException quando task não é encontrada', async () => {
      const params: GetTaskParamsDto = { id: 'non-existent' };

      repository.findById.mockResolvedValue(null);

      await expect(useCase.execute(params)).rejects.toThrow(
        BadRequestException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('não encontrada'),
        'GetTaskUseCase',
      );
    });

    it('deve logar quando task é encontrada', async () => {
      const params: GetTaskParamsDto = { id: 'task-123' };

      repository.findById.mockResolvedValue(mockTask);

      await useCase.execute(params);

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('encontrada com sucesso'),
        'GetTaskUseCase',
      );
    });

    it('deve tratar erros e lançar BadRequestException', async () => {
      const params: GetTaskParamsDto = { id: 'task-123' };

      repository.findById.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(params)).rejects.toThrow(
        BadRequestException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
