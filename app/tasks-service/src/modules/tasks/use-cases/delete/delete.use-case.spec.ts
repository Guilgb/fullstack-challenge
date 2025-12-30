import { TaskRepositoryInterface } from '@modules/tasks/interfaces/task.repository.interface';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { EventsService } from '../../../../shared/services/events.service';
import { DeleteTaskUseCase } from './delete.use-case';
import { DeleteTaskParamsDto } from './dto/delete.dto';

describe('DeleteTaskUseCase', () => {
  let useCase: DeleteTaskUseCase;
  let repository: jest.Mocked<TaskRepositoryInterface>;
  let logger: jest.Mocked<WinstonLoggerService>;
  let eventsService: jest.Mocked<EventsService>;

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

    const mockEventsService = {
      publishTaskCreated: jest.fn(),
      publishTaskUpdated: jest.fn(),
      publishTaskAssigned: jest.fn(),
      publishTaskStatusChanged: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteTaskUseCase,
        {
          provide: TaskRepositoryInterface,
          useValue: mockRepository,
        },
        {
          provide: WinstonLoggerService,
          useValue: mockLogger,
        },
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    useCase = module.get<DeleteTaskUseCase>(DeleteTaskUseCase);
    repository = module.get(TaskRepositoryInterface);
    logger = module.get(WinstonLoggerService);
    eventsService = module.get(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve deletar task com sucesso', async () => {
      const params: DeleteTaskParamsDto = { id: 'task-123' };
      const userId = 'user-123';

      repository.findById.mockResolvedValue(mockTask);
      repository.delete.mockResolvedValue(undefined);

      await useCase.execute(params, userId);

      expect(repository.findById).toHaveBeenCalledWith(params.id);
      expect(repository.delete).toHaveBeenCalledWith(params.id);
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('deletada com sucesso'),
        'DeleteTaskUseCase',
        expect.objectContaining({ id: params.id }),
      );
    });

    it('deve publicar evento de atualização após deletar', async () => {
      const params: DeleteTaskParamsDto = { id: 'task-123' };
      const userId = 'user-123';

      repository.findById.mockResolvedValue(mockTask);
      repository.delete.mockResolvedValue(undefined);

      await useCase.execute(params, userId);

      expect(eventsService.publishTaskUpdated).toHaveBeenCalledWith({
        taskId: params.id,
        taskTitle: mockTask.title,
        userId,
      });
    });

    it('deve usar userId "system" quando não fornecido', async () => {
      const params: DeleteTaskParamsDto = { id: 'task-123' };

      repository.findById.mockResolvedValue(mockTask);
      repository.delete.mockResolvedValue(undefined);

      await useCase.execute(params);

      expect(eventsService.publishTaskUpdated).toHaveBeenCalledWith({
        taskId: params.id,
        taskTitle: mockTask.title,
        userId: 'system',
      });
    });

    it('deve lidar com task não encontrada', async () => {
      const params: DeleteTaskParamsDto = { id: 'task-123' };

      repository.findById.mockResolvedValue(null);
      repository.delete.mockResolvedValue(undefined);

      await useCase.execute(params);

      expect(repository.delete).toHaveBeenCalled();
      expect(eventsService.publishTaskUpdated).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException em caso de erro', async () => {
      const params: DeleteTaskParamsDto = { id: 'task-123' };

      repository.findById.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(params)).rejects.toThrow(
        BadRequestException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
