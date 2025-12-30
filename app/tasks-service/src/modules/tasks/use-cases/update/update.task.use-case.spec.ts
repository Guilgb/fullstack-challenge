import { TaskRepositoryInterface } from '@modules/tasks/interfaces/task.repository.interface';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { EventsService } from '../../../../shared/services/events.service';
import { UpdateTaskInputDto, UpdateTaskParamsDto } from './dto/update.task.dto';
import { UpdateTaskUseCase } from './update.task.use-case';

describe('UpdateTaskUseCase', () => {
  let useCase: UpdateTaskUseCase;
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
        UpdateTaskUseCase,
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

    useCase = module.get<UpdateTaskUseCase>(UpdateTaskUseCase);
    repository = module.get(TaskRepositoryInterface);
    logger = module.get(WinstonLoggerService);
    eventsService = module.get(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve atualizar task com sucesso', async () => {
      const params: UpdateTaskParamsDto = { id: 'task-123' };
      const input: UpdateTaskInputDto = {
        title: 'Updated Task',
        description: 'Updated Description',
      };
      const userId = 'user-123';

      repository.findById.mockResolvedValue(mockTask);
      repository.update.mockResolvedValue({ ...mockTask, ...input });

      const result = await useCase.execute(params, input, userId);

      expect(result.title).toBe(input.title);
      expect(result.description).toBe(input.description);
      expect(repository.update).toHaveBeenCalledWith(params, input);
    });

    it('deve lançar NotFoundException quando task não existe', async () => {
      const params: UpdateTaskParamsDto = { id: 'non-existent' };
      const input: UpdateTaskInputDto = { title: 'Updated' };

      repository.findById.mockResolvedValue(null);

      await expect(useCase.execute(params, input)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve publicar evento quando assignedTo muda', async () => {
      const params: UpdateTaskParamsDto = { id: 'task-123' };
      const input: UpdateTaskInputDto = { assignedTo: 'new-user' };
      const userId = 'user-123';

      repository.findById.mockResolvedValue(mockTask);
      repository.update.mockResolvedValue({ ...mockTask, ...input });

      await useCase.execute(params, input, userId);

      expect(eventsService.publishTaskAssigned).toHaveBeenCalledWith({
        taskId: mockTask.id,
        taskTitle: mockTask.title,
        userId,
        assignedTo: input.assignedTo,
      });
    });

    it('não deve publicar evento de assignedTo quando usuário atribui para si mesmo', async () => {
      const params: UpdateTaskParamsDto = { id: 'task-123' };
      const userId = 'user-123';
      const input: UpdateTaskInputDto = { assignedTo: userId };

      repository.findById.mockResolvedValue(mockTask);
      repository.update.mockResolvedValue({ ...mockTask, ...input });

      await useCase.execute(params, input, userId);

      expect(eventsService.publishTaskAssigned).not.toHaveBeenCalled();
    });

    it('deve publicar evento quando status muda', async () => {
      const params: UpdateTaskParamsDto = { id: 'task-123' };
      const input: UpdateTaskInputDto = { status: 'DONE' as any };
      const userId = 'user-123';

      repository.findById.mockResolvedValue(mockTask);
      repository.update.mockResolvedValue({ ...mockTask, ...input });

      await useCase.execute(params, input, userId);

      expect(eventsService.publishTaskStatusChanged).toHaveBeenCalledWith(
        expect.objectContaining({
          taskId: mockTask.id,
          taskTitle: mockTask.title,
          userId,
          previousStatus: 'TODO',
          newStatus: 'DONE',
        }),
      );
    });

    it('deve incluir participantes no evento de mudança de status', async () => {
      const params: UpdateTaskParamsDto = { id: 'task-123' };
      const input: UpdateTaskInputDto = { status: 'IN_PROGRESS' as any };
      const userId = 'user-123';

      repository.findById.mockResolvedValue(mockTask);
      repository.update.mockResolvedValue({ ...mockTask, ...input });

      await useCase.execute(params, input, userId);

      expect(eventsService.publishTaskStatusChanged).toHaveBeenCalledWith(
        expect.objectContaining({
          participants: expect.arrayContaining([mockTask.assignedTo]),
        }),
      );
    });

    it('deve sempre publicar evento de task atualizada', async () => {
      const params: UpdateTaskParamsDto = { id: 'task-123' };
      const input: UpdateTaskInputDto = { title: 'Updated' };
      const userId = 'user-123';

      const updatedTask = { ...mockTask, ...input };

      repository.findById.mockResolvedValue(mockTask);
      repository.update.mockResolvedValue(updatedTask);

      await useCase.execute(params, input, userId);

      expect(eventsService.publishTaskUpdated).toHaveBeenCalledWith({
        taskId: updatedTask.id,
        taskTitle: updatedTask.title,
        userId,
      });
    });

    it('deve usar "system" como userId quando não fornecido', async () => {
      const params: UpdateTaskParamsDto = { id: 'task-123' };
      const input: UpdateTaskInputDto = { title: 'Updated' };

      const updatedTask = { ...mockTask, ...input };

      repository.findById.mockResolvedValue(mockTask);
      repository.update.mockResolvedValue(updatedTask);

      await useCase.execute(params, input);

      expect(eventsService.publishTaskUpdated).toHaveBeenCalledWith({
        taskId: updatedTask.id,
        taskTitle: updatedTask.title,
        userId: 'system',
      });
    });

    it('deve lançar BadRequestException em caso de erro', async () => {
      const params: UpdateTaskParamsDto = { id: 'task-123' };
      const input: UpdateTaskInputDto = { title: 'Updated' };

      repository.findById.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(params, input)).rejects.toThrow(
        BadRequestException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
