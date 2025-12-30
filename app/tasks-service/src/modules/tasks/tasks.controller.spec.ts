import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { CreateTaskUseCase } from './use-cases/create/create.use-case';
import { CreateTaskInputDto } from './use-cases/create/dto/create.dto';
import { DeleteTaskUseCase } from './use-cases/delete/delete.use-case';
import { GetTaskUseCase } from './use-cases/get/get.use-case';
import { ListTasksUseCase } from './use-cases/list/list.use-case';
import { UpdateTaskUseCase } from './use-cases/update/update.task.use-case';

describe('TasksController', () => {
  let controller: TasksController;
  let createTaskUseCase: jest.Mocked<CreateTaskUseCase>;
  let getTaskUseCase: jest.Mocked<GetTaskUseCase>;
  let listTasksUseCase: jest.Mocked<ListTasksUseCase>;
  let deleteTaskUseCase: jest.Mocked<DeleteTaskUseCase>;
  let updateTaskUseCase: jest.Mocked<UpdateTaskUseCase>;

  const mockAuthUser = {
    sub: 'user-123',
    email: 'test@example.com',
    role: 'USER',
  };

  const mockTask = {
    id: 'task-123',
    title: 'Test Task',
    description: 'Test Description',
    priority: 'HIGH' as any,
    deadline: new Date('2025-12-31'),
    boardId: 'board-123',
    assignedTo: 'user-assigned',
    createdBy: 'user-creator',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: CreateTaskUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetTaskUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListTasksUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteTaskUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateTaskUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    createTaskUseCase = module.get(CreateTaskUseCase);
    getTaskUseCase = module.get(GetTaskUseCase);
    listTasksUseCase = module.get(ListTasksUseCase);
    deleteTaskUseCase = module.get(DeleteTaskUseCase);
    updateTaskUseCase = module.get(UpdateTaskUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('deve criar uma task com sucesso', async () => {
      const input: CreateTaskInputDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'HIGH' as any,
        boardId: 'board-123',
      };

      createTaskUseCase.execute.mockResolvedValue(mockTask);

      const result = await controller.createTask(mockAuthUser, input);

      expect(result).toEqual(mockTask);
      expect(createTaskUseCase.execute).toHaveBeenCalledWith(
        input,
        mockAuthUser.sub,
      );
    });

    it('deve propagar erro do use case', async () => {
      const input: CreateTaskInputDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'HIGH' as any,
        boardId: 'board-123',
      };

      const error = new Error('Failed to create task');
      createTaskUseCase.execute.mockRejectedValue(error);

      await expect(controller.createTask(mockAuthUser, input)).rejects.toThrow(
        error,
      );
    });
  });

  describe('listTasks', () => {
    it('deve listar tasks com paginação', async () => {
      const query = {
        page: 1,
        pageSize: 10,
        orderBy: 'createdAt' as any,
        orderDirection: 'DESC' as any,
      };

      const expectedResult = {
        tasks: [mockTask],
        total: 1,
        page: 1,
        pageSize: 10,
      };

      listTasksUseCase.execute.mockResolvedValue(expectedResult as any);

      const result = await controller.listTasks(mockAuthUser, query);

      expect(result).toEqual(expectedResult);
      expect(listTasksUseCase.execute).toHaveBeenCalledWith(query);
    });
  });

  describe('getTask', () => {
    it('deve obter uma task por ID', async () => {
      const params = { id: 'task-123' };

      getTaskUseCase.execute.mockResolvedValue(mockTask);

      const result = await controller.getTask(mockAuthUser, params);

      expect(result).toEqual(mockTask);
      expect(getTaskUseCase.execute).toHaveBeenCalledWith(params);
    });
  });

  describe('updateTask', () => {
    it('deve atualizar uma task', async () => {
      const params = { id: 'task-123' };
      const input = {
        title: 'Updated Task',
        priority: 'LOW' as any,
      };

      const updatedTask = { ...mockTask, ...input };
      updateTaskUseCase.execute.mockResolvedValue(updatedTask as any);

      const result = await controller.updateTask(mockAuthUser, params, input);

      expect(result).toEqual(updatedTask);
      expect(updateTaskUseCase.execute).toHaveBeenCalledWith(
        params,
        input,
        mockAuthUser.sub,
      );
    });
  });

  describe('deleteTask', () => {
    it('deve deletar uma task', async () => {
      const params = { id: 'task-123' };

      deleteTaskUseCase.execute.mockResolvedValue(undefined);

      await controller.deleteTask(mockAuthUser, params);

      expect(deleteTaskUseCase.execute).toHaveBeenCalledWith(
        params,
        mockAuthUser.sub,
      );
    });
  });
});
