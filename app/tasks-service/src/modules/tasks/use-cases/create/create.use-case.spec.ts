import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { EventsService } from '../../../../shared/services/events.service';
import { TaskRepositoryInterface } from '../../interfaces/task.repository.interface';
import { CreateTaskUseCase } from './create.use-case';
import { CreateTaskInputDto } from './dto/create.dto';

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase;
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
      list: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const mockEventsService = {
      publishTaskCreated: jest.fn(),
      publishTaskUpdated: jest.fn(),
      publishTaskStatusChanged: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTaskUseCase,
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

    useCase = module.get<CreateTaskUseCase>(CreateTaskUseCase);
    repository = module.get(TaskRepositoryInterface);
    logger = module.get(WinstonLoggerService);
    eventsService = module.get(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve criar uma task com sucesso', async () => {
      const input: CreateTaskInputDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'HIGH' as any,
        deadline: new Date('2025-12-31'),
        boardId: 'board-123',
        assignedTo: 'user-assigned',
      };

      const userId = 'user-creator';

      repository.create.mockResolvedValue(mockTask);
      eventsService.publishTaskCreated.mockResolvedValue(undefined);

      const result = await useCase.execute(input, userId);

      expect(result).toEqual({
        id: mockTask.id,
        title: mockTask.title,
        description: mockTask.description,
        priority: mockTask.priority,
        deadline: mockTask.deadline,
        boardId: mockTask.boardId,
        assignedTo: mockTask.assignedTo,
        createdBy: mockTask.createdBy,
        createdAt: mockTask.createdAt,
        updatedAt: mockTask.updatedAt,
      });

      expect(repository.create).toHaveBeenCalledWith(
        input,
        expect.any(String),
        userId,
      );
      expect(logger.log).toHaveBeenCalledTimes(2);
      expect(eventsService.publishTaskCreated).toHaveBeenCalledWith({
        taskId: mockTask.id,
        taskTitle: mockTask.title,
        userId,
        assignedTo: input.assignedTo,
      });
    });

    it('deve gerar UUID para nova task', async () => {
      const input: CreateTaskInputDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'MEDIUM' as any,
        boardId: 'board-123',
      };

      repository.create.mockResolvedValue(mockTask);
      eventsService.publishTaskCreated.mockResolvedValue(undefined);

      await useCase.execute(input, 'user-creator');

      expect(repository.create).toHaveBeenCalledWith(
        input,
        expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ),
        'user-creator',
      );
    });

    it('deve publicar evento de task criada', async () => {
      const input: CreateTaskInputDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'LOW' as any,
        boardId: 'board-123',
        assignedTo: 'user-assigned',
      };

      const userId = 'user-creator';

      repository.create.mockResolvedValue(mockTask);
      eventsService.publishTaskCreated.mockResolvedValue(undefined);

      await useCase.execute(input, userId);

      expect(eventsService.publishTaskCreated).toHaveBeenCalledWith({
        taskId: mockTask.id,
        taskTitle: mockTask.title,
        userId,
        assignedTo: input.assignedTo,
      });
    });

    it('deve usar "system" como userId quando userId não for fornecido', async () => {
      const input: CreateTaskInputDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'HIGH' as any,
        boardId: 'board-123',
      };

      repository.create.mockResolvedValue(mockTask);
      eventsService.publishTaskCreated.mockResolvedValue(undefined);

      await useCase.execute(input, null);

      expect(eventsService.publishTaskCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'system',
        }),
      );
    });

    it('deve propagar BadRequestException', async () => {
      const input: CreateTaskInputDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'HIGH' as any,
        boardId: 'board-123',
      };

      const error = new BadRequestException('Validation error');
      repository.create.mockRejectedValue(error);

      await expect(useCase.execute(input, 'user-creator')).rejects.toThrow(
        BadRequestException,
      );
      await expect(useCase.execute(input, 'user-creator')).rejects.toThrow(
        'Validation error',
      );
    });

    it('deve lançar BadRequestException para erros gerais', async () => {
      const input: CreateTaskInputDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'HIGH' as any,
        boardId: 'board-123',
      };

      repository.create.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(input, 'user-creator')).rejects.toThrow(
        BadRequestException,
      );
      await expect(useCase.execute(input, 'user-creator')).rejects.toThrow(
        'Falha ao criar task',
      );

      expect(logger.error).toHaveBeenCalled();
    });

    it('deve logar informações durante a criação', async () => {
      const input: CreateTaskInputDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'HIGH' as any,
        boardId: 'board-123',
      };

      repository.create.mockResolvedValue(mockTask);
      eventsService.publishTaskCreated.mockResolvedValue(undefined);

      await useCase.execute(input, 'user-creator');

      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('Criando task'),
        'CreateTaskUseCase',
        expect.any(Object),
      );

      expect(logger.log).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('Task criada com sucesso'),
        'CreateTaskUseCase',
        expect.any(Object),
      );
    });
  });
});
