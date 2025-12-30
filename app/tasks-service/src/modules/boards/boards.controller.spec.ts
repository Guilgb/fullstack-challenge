import { Test, TestingModule } from '@nestjs/testing';
import { BoardsController } from './boards.controller';
import { CreateBoardUseCase } from './use-cases/create-board/create-board.use-case';
import { CreateBoardInputDto } from './use-cases/create-board/dto/create-board.dto';
import { DeleteBoardUseCase } from './use-cases/delete-board/delete-board.use-case';
import { GetBoardUseCase } from './use-cases/get-board/get-board.use-case';
import { ListBoardsUseCase } from './use-cases/list-boards/list-boards.use-case';
import { ListTasksBoardsUseCase } from './use-cases/list-tasks-boards/list-tasks-boards.use-case';
import { ManageMembersUseCase } from './use-cases/manage-members/manage-members.use-case';
import { UpdateBoardUseCase } from './use-cases/update-board/update-board.use-case';

describe('BoardsController', () => {
  let controller: BoardsController;
  let createBoardUseCase: jest.Mocked<CreateBoardUseCase>;
  let getBoardUseCase: jest.Mocked<GetBoardUseCase>;
  let listBoardsUseCase: jest.Mocked<ListBoardsUseCase>;
  let updateBoardUseCase: jest.Mocked<UpdateBoardUseCase>;
  let deleteBoardUseCase: jest.Mocked<DeleteBoardUseCase>;
  let manageMembersUseCase: jest.Mocked<ManageMembersUseCase>;
  let listTasksBoardsUseCase: jest.Mocked<ListTasksBoardsUseCase>;

  const mockAuthUser = {
    sub: 'user-123',
    email: 'test@example.com',
    role: 'USER',
  };

  const mockBoard = {
    id: 'board-123',
    name: 'Test Board',
    description: 'Test Description',
    ownerId: 'user-123',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardsController],
      providers: [
        {
          provide: CreateBoardUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetBoardUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListBoardsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateBoardUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteBoardUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ManageMembersUseCase,
          useValue: {
            addMember: jest.fn(),
            removeMember: jest.fn(),
            updateMemberRole: jest.fn(),
          },
        },
        {
          provide: ListTasksBoardsUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<BoardsController>(BoardsController);
    createBoardUseCase = module.get(CreateBoardUseCase);
    getBoardUseCase = module.get(GetBoardUseCase);
    listBoardsUseCase = module.get(ListBoardsUseCase);
    updateBoardUseCase = module.get(UpdateBoardUseCase);
    deleteBoardUseCase = module.get(DeleteBoardUseCase);
    manageMembersUseCase = module.get(ManageMembersUseCase);
    listTasksBoardsUseCase = module.get(ListTasksBoardsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBoard', () => {
    it('deve criar um board com sucesso', async () => {
      const input: CreateBoardInputDto = {
        name: 'Test Board',
        description: 'Test Description',
      };

      createBoardUseCase.execute.mockResolvedValue(mockBoard);

      const result = await controller.createBoard(mockAuthUser, input);

      expect(result).toEqual(mockBoard);
      expect(createBoardUseCase.execute).toHaveBeenCalledWith(
        input,
        mockAuthUser.sub,
      );
    });

    it('deve propagar erro do use case', async () => {
      const input: CreateBoardInputDto = {
        name: 'Test Board',
        description: 'Test Description',
      };

      const error = new Error('Failed to create board');
      createBoardUseCase.execute.mockRejectedValue(error);

      await expect(controller.createBoard(mockAuthUser, input)).rejects.toThrow(
        error,
      );
    });
  });

  describe('listBoards', () => {
    it('deve listar boards do usuário', async () => {
      const query = {
        page: 1,
        pageSize: 10,
      };

      const expectedResult = {
        boards: [mockBoard],
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      };

      listBoardsUseCase.execute.mockResolvedValue(expectedResult as any);

      const result = await controller.listBoards(mockAuthUser, query);

      expect(result).toEqual(expectedResult);
      expect(listBoardsUseCase.execute).toHaveBeenCalledWith(
        query,
        mockAuthUser.sub,
      );
    });
  });

  describe('getBoard', () => {
    it('deve obter um board por ID', async () => {
      const params = { id: 'board-123' };

      const detailedBoard = {
        ...mockBoard,
        members: [],
        tasks: [],
        updatedAt: new Date(),
      };

      getBoardUseCase.execute.mockResolvedValue(detailedBoard);

      const result = await controller.getBoard(mockAuthUser, params);

      expect(result).toEqual(detailedBoard);
      expect(getBoardUseCase.execute).toHaveBeenCalledWith(
        params,
        mockAuthUser.sub,
      );
    });
  });

  describe('updateBoard', () => {
    it('deve atualizar um board', async () => {
      const params = { id: 'board-123' };
      const input = {
        name: 'Updated Board',
        description: 'Updated Description',
      };

      const updatedBoard = { ...mockBoard, ...input };
      updateBoardUseCase.execute.mockResolvedValue(updatedBoard);

      const result = await controller.updateBoard(mockAuthUser, params, input);

      expect(result).toEqual(updatedBoard);
      expect(updateBoardUseCase.execute).toHaveBeenCalledWith(
        params,
        input,
        mockAuthUser.sub,
      );
    });
  });

  describe('deleteBoard', () => {
    it('deve deletar um board', async () => {
      const params = { id: 'board-123' };

      deleteBoardUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.deleteBoard(mockAuthUser, params);

      expect(result).toBeUndefined();
      expect(deleteBoardUseCase.execute).toHaveBeenCalledWith(
        params,
        mockAuthUser.sub,
      );
    });
  });

  describe('addMember', () => {
    it('deve adicionar um membro ao board', async () => {
      const params = { boardId: 'board-123' };
      const input = {
        userId: 'user-456',
        role: 'MEMBER' as any,
      };

      const expectedResult = {
        id: 'member-123',
        boardId: 'board-123',
        userId: 'user-456',
        role: 'MEMBER' as any,
        joinedAt: new Date(),
      };

      manageMembersUseCase.addMember.mockResolvedValue(expectedResult);

      const result = await controller.addMember(mockAuthUser, params, input);

      expect(result).toEqual(expectedResult);
      expect(manageMembersUseCase.addMember).toHaveBeenCalledWith(
        params,
        input,
        mockAuthUser.sub,
      );
    });
  });

  describe('listBoardTasks', () => {
    it('deve listar tasks de um board', async () => {
      const boardId = 'board-123';
      const page = 1;
      const pageSize = 10;

      const expectedResult = {
        tasks: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      };

      listTasksBoardsUseCase.execute.mockResolvedValue(expectedResult as any);

      const result = await controller.listBoardTasks(boardId, page, pageSize);

      expect(result).toEqual(expectedResult);
      expect(listTasksBoardsUseCase.execute).toHaveBeenCalledWith({
        boardId,
        page,
        pageSize,
      });
    });
  });
});
