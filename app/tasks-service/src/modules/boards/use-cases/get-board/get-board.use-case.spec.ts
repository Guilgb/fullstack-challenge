import { BoardRepositoryInterface } from '@modules/boards/interfaces/board.repository.interface';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { GetBoardParamsDto } from './dto/get-board.dto';
import { GetBoardUseCase } from './get-board.use-case';

describe('GetBoardUseCase', () => {
  let useCase: GetBoardUseCase;
  let repository: jest.Mocked<BoardRepositoryInterface>;
  let logger: jest.Mocked<WinstonLoggerService>;

  const mockBoard = {
    id: 'board-123',
    name: 'Test Board',
    description: 'Test Description',
    ownerId: 'owner-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    members: [
      {
        id: 'member-1',
        userId: 'user-1',
        boardId: 'board-123',
        role: 'MEMBER' as any,
        joinedAt: new Date(),
        board: null as any,
        user: { username: 'user1' } as any,
      },
    ],
    tasks: [],
  };

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
        GetBoardUseCase,
        {
          provide: BoardRepositoryInterface,
          useValue: mockRepository,
        },
        {
          provide: WinstonLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    useCase = module.get<GetBoardUseCase>(GetBoardUseCase);
    repository = module.get(BoardRepositoryInterface);
    logger = module.get(WinstonLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve retornar board quando usuário é membro', async () => {
      const params: GetBoardParamsDto = { id: 'board-123' };
      const userId = 'user-1';

      repository.findByIdWithMembers.mockResolvedValue(mockBoard);
      repository.isMember.mockResolvedValue(true);

      const result = await useCase.execute(params, userId);

      expect(result).toEqual({
        id: mockBoard.id,
        name: mockBoard.name,
        description: mockBoard.description,
        ownerId: mockBoard.ownerId,
        members: expect.arrayContaining([
          expect.objectContaining({
            id: 'member-1',
            userId: 'user-1',
            username: 'user1',
          }),
        ]),
        createdAt: mockBoard.createdAt,
        updatedAt: mockBoard.updatedAt,
      });
    });

    it('deve lançar NotFoundException quando board não existe', async () => {
      const params: GetBoardParamsDto = { id: 'non-existent' };
      const userId = 'user-1';

      repository.findByIdWithMembers.mockResolvedValue(null);

      await expect(useCase.execute(params, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar NotFoundException quando usuário não é membro', async () => {
      const params: GetBoardParamsDto = { id: 'board-123' };
      const userId = 'non-member';

      repository.findByIdWithMembers.mockResolvedValue(mockBoard);
      repository.isMember.mockResolvedValue(false);

      await expect(useCase.execute(params, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve logar ao buscar board', async () => {
      const params: GetBoardParamsDto = { id: 'board-123' };
      const userId = 'user-1';

      repository.findByIdWithMembers.mockResolvedValue(mockBoard);
      repository.isMember.mockResolvedValue(true);

      await useCase.execute(params, userId);

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Getting board'),
      );
    });

    it('deve retornar board sem members quando não há members', async () => {
      const params: GetBoardParamsDto = { id: 'board-123' };
      const userId = 'user-1';

      const boardWithoutMembers = { ...mockBoard, members: null };
      repository.findByIdWithMembers.mockResolvedValue(boardWithoutMembers);
      repository.isMember.mockResolvedValue(true);

      const result = await useCase.execute(params, userId);

      expect(result.members).toEqual([]);
    });
  });
});
