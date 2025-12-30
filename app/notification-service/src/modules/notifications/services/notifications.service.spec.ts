import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotificationEntity,
  NotificationType,
} from '../../../shared/database/entities/notification.entity';
import { TaskEvent } from '../interfaces/task-event.interface';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repository: jest.Mocked<Repository<NotificationEntity>>;

  const mockNotification: NotificationEntity = {
    id: 'notif-123',
    userId: 'user-123',
    type: NotificationType.TASK_ASSIGNED,
    title: 'Tarefa atribuída',
    message: 'A tarefa "Test Task" foi atribuída a você',
    taskId: 'task-123',
    read: false,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(NotificationEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repository = module.get(getRepositoryToken(NotificationEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createFromTaskEvent', () => {
    it('deve criar notificação quando tarefa é atribuída', async () => {
      const event: TaskEvent = {
        eventType: 'task.assigned',
        taskId: 'task-123',
        taskTitle: 'Test Task',
        userId: 'user-creator',
        assignedTo: 'user-assignee',
        timestamp: new Date(),
      };

      repository.create.mockReturnValue(mockNotification);
      repository.save.mockResolvedValue(mockNotification);

      const result = await service.createFromTaskEvent(event);

      expect(result).toHaveLength(1);
      expect(repository.create).toHaveBeenCalledWith({
        userId: 'user-assignee',
        type: NotificationType.TASK_ASSIGNED,
        title: 'Tarefa atribuída',
        message: 'A tarefa "Test Task" foi atribuída a você',
        taskId: 'task-123',
        metadata: { assignedBy: 'user-creator' },
      });
      expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('não deve criar notificação quando tarefa atribuída sem assignedTo', async () => {
      const event: TaskEvent = {
        eventType: 'task.assigned',
        taskId: 'task-123',
        taskTitle: 'Test Task',
        userId: 'user-creator',
        timestamp: new Date(),
      };

      const result = await service.createFromTaskEvent(event);

      expect(result).toHaveLength(0);
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('deve criar notificações quando status da tarefa muda', async () => {
      const event: TaskEvent = {
        eventType: 'task.status_changed',
        taskId: 'task-123',
        taskTitle: 'Test Task',
        userId: 'user-changer',
        previousStatus: 'TODO',
        newStatus: 'IN_PROGRESS',
        participants: ['user-1', 'user-2'],
        timestamp: new Date(),
      };

      const notification1 = { ...mockNotification, userId: 'user-1' };
      const notification2 = { ...mockNotification, userId: 'user-2' };

      repository.create
        .mockReturnValueOnce(notification1)
        .mockReturnValueOnce(notification2);
      repository.save
        .mockResolvedValueOnce(notification1)
        .mockResolvedValueOnce(notification2);

      const result = await service.createFromTaskEvent(event);

      expect(result).toHaveLength(2);
      expect(repository.create).toHaveBeenCalledTimes(2);
      expect(repository.save).toHaveBeenCalledTimes(2);

      expect(repository.create).toHaveBeenNthCalledWith(1, {
        userId: 'user-1',
        type: NotificationType.TASK_STATUS_CHANGED,
        title: 'Status alterado',
        message: 'A tarefa "Test Task" mudou de "TODO" para "IN_PROGRESS"',
        taskId: 'task-123',
        metadata: {
          previousStatus: 'TODO',
          newStatus: 'IN_PROGRESS',
          changedBy: 'user-changer',
        },
      });
    });

    it('deve criar notificação de comentário exceto para o autor', async () => {
      const event: TaskEvent = {
        eventType: 'task.comment',
        taskId: 'task-123',
        taskTitle: 'Test Task',
        userId: 'user-creator',
        commentAuthor: 'user-author',
        commentText: 'This is a comment',
        participants: ['user-author', 'user-1', 'user-2'],
        timestamp: new Date(),
      };

      const notification1 = { ...mockNotification, userId: 'user-1' };
      const notification2 = { ...mockNotification, userId: 'user-2' };

      repository.create
        .mockReturnValueOnce(notification1)
        .mockReturnValueOnce(notification2);
      repository.save
        .mockResolvedValueOnce(notification1)
        .mockResolvedValueOnce(notification2);

      const result = await service.createFromTaskEvent(event);

      // Deve criar apenas para user-1 e user-2, não para o autor do comentário
      expect(result).toHaveLength(2);
      expect(repository.create).toHaveBeenCalledTimes(2);
    });

    it('deve criar notificação quando tarefa é criada e atribuída', async () => {
      const event: TaskEvent = {
        eventType: 'task.created',
        taskId: 'task-123',
        taskTitle: 'New Task',
        userId: 'user-creator',
        assignedTo: 'user-assignee',
        timestamp: new Date(),
      };

      repository.create.mockReturnValue(mockNotification);
      repository.save.mockResolvedValue(mockNotification);

      const result = await service.createFromTaskEvent(event);

      expect(result).toHaveLength(1);
      expect(repository.create).toHaveBeenCalledWith({
        userId: 'user-assignee',
        type: NotificationType.TASK_CREATED,
        title: 'Nova tarefa',
        message: 'Uma nova tarefa "New Task" foi criada e atribuída a você',
        taskId: 'task-123',
        metadata: { createdBy: 'user-creator' },
      });
    });

    it('não deve criar notificação quando tarefa criada é atribuída ao próprio criador', async () => {
      const event: TaskEvent = {
        eventType: 'task.created',
        taskId: 'task-123',
        taskTitle: 'New Task',
        userId: 'user-creator',
        assignedTo: 'user-creator', // Mesmo usuário
        timestamp: new Date(),
      };

      const result = await service.createFromTaskEvent(event);

      expect(result).toHaveLength(0);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('deve truncar preview de comentário para 100 caracteres', async () => {
      const longComment = 'a'.repeat(150);
      const event: TaskEvent = {
        eventType: 'task.comment',
        taskId: 'task-123',
        taskTitle: 'Test Task',
        userId: 'user-creator',
        commentAuthor: 'user-author',
        commentText: longComment,
        participants: ['user-1'],
        timestamp: new Date(),
      };

      repository.create.mockReturnValue(mockNotification);
      repository.save.mockResolvedValue(mockNotification);

      await service.createFromTaskEvent(event);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            commentPreview: longComment.substring(0, 100),
          }),
        }),
      );
    });

    it('deve retornar array vazio para evento task.updated sem processamento específico', async () => {
      const event: TaskEvent = {
        eventType: 'task.updated',
        taskId: 'task-123',
        taskTitle: 'Updated Task',
        userId: 'user-updater',
        timestamp: new Date(),
      };

      const result = await service.createFromTaskEvent(event);

      expect(result).toHaveLength(0);
    });
  });
});
