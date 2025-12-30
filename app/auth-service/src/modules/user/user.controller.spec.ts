import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@shared/modules/database/entities/user.entity';
import { CreateUserUseCase } from './use-cases/create/create.use-case';
import { CreateUserDto } from './use-cases/create/dto/user.create.dto';
import { DeleteUserUseCase } from './use-cases/delete/delete.use-case';
import { GetUserUseCase } from './use-cases/get/get.use-case';
import { ListUsersUseCase } from './use-cases/list/list.use-case';
import { UpdateUserUseCase } from './use-cases/update/update.use-case';
import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;
  let createUserUseCase: jest.Mocked<CreateUserUseCase>;
  let updateUserUseCase: jest.Mocked<UpdateUserUseCase>;
  let listUsersUseCase: jest.Mocked<ListUsersUseCase>;
  let deleteUserUseCase: jest.Mocked<DeleteUserUseCase>;
  let getUserUseCase: jest.Mocked<GetUserUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: CreateUserUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateUserUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListUsersUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteUserUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetUserUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    createUserUseCase = module.get(CreateUserUseCase);
    updateUserUseCase = module.get(UpdateUserUseCase);
    listUsersUseCase = module.get(ListUsersUseCase);
    deleteUserUseCase = module.get(DeleteUserUseCase);
    getUserUseCase = module.get(GetUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um usuário com sucesso', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      const expectedResult = {
        id: 'user-123',
        email: createUserDto.email,
        username: createUserDto.username,
        role: UserRole.USER,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      createUserUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedResult);
      expect(createUserUseCase.execute).toHaveBeenCalledWith(createUserDto);
      expect(createUserUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('deve propagar erro quando email já está em uso', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        username: 'testuser',
        password: 'password123',
      };

      const error = new Error('Email já está em uso');
      createUserUseCase.execute.mockRejectedValue(error);

      await expect(controller.create(createUserDto)).rejects.toThrow(error);
      expect(createUserUseCase.execute).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('deve listar usuários com paginação', async () => {
      const query = {
        page: 1,
        pageSize: 10,
      };

      const expectedResult = {
        users: [
          {
            id: 'user-1',
            email: 'user1@example.com',
            username: 'user1',
            role: UserRole.USER,
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      };

      listUsersUseCase.execute.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(listUsersUseCase.execute).toHaveBeenCalledWith(query);
    });
  });

  describe('findUser', () => {
    it('deve obter um usuário por ID ou email', async () => {
      const params = { idOrEmail: 'user-123' };

      const expectedResult = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        role: UserRole.USER,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getUserUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.findUser(params);

      expect(result).toEqual(expectedResult);
      expect(getUserUseCase.execute).toHaveBeenCalledWith(params);
    });
  });

  describe('update', () => {
    it('deve atualizar um usuário', async () => {
      const params = { idOrEmail: 'user-123' };
      const updateDto = {
        email: 'newemail@example.com',
      };

      const expectedResult = {
        id: 'user-123',
        email: 'newemail@example.com',
        username: 'testuser',
        role: UserRole.USER,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      updateUserUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.update(params, updateDto);

      expect(result).toEqual(expectedResult);
      expect(updateUserUseCase.execute).toHaveBeenCalledWith(params, updateDto);
    });
  });

  describe('delete', () => {
    it('deve deletar um usuário', async () => {
      const params = { idOrEmail: 'user-123' };

      deleteUserUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.delete(params);

      expect(result).toBeUndefined();
      expect(deleteUserUseCase.execute).toHaveBeenCalledWith(params);
    });
  });
});
