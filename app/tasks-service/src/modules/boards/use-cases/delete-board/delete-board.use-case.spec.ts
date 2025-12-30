import { BoardRepositoryInterface } from '@modules/boards/interfaces/board.repository.interface';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { DeleteBoardUseCase } from './delete-board.use-case';
import { DeleteBoardParamsDto } from './dto/delete-board.dto';

describe('DeleteBoardUseCase', () => {
  let useCase: DeleteBoardUseCase;
  let repository: jest.Mocked<BoardRepositoryInterface>;
  let logger: jest.Mocked<WinstonLoggerService>;

  const mockBoard = {
    id: 'board-123',
    name: 'Test Board',
    description: 'Test Description',
    ownerId: 'owner-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    members: [],
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
        DeleteBoardUseCase,
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

    useCase = module.get<DeleteBoardUseCase>(DeleteBoardUseCase);
    repository = module.get(BoardRepositoryInterface);
    logger = module.get(WinstonLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve deletar board quando usuário é owner', async () => {
      const params: DeleteBoardParamsDto = { id: 'board-123' };
      const userId = 'owner-123';

      repository.findById.mockResolvedValue(mockBoard);
      repository.delete.mockResolvedValue(undefined);

      await useCase.execute(params, userId);

      expect(repository.delete).toHaveBeenCalledWith(params.id);
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('deleted successfully'),
      );
    });

    it('deve lançar NotFoundException quando board não existe', async () => {
      const params: DeleteBoardParamsDto = { id: 'non-existent' };
      const userId = 'owner-123';

      repository.findById.mockResolvedValue(null);

      await expect(useCase.execute(params, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar ForbiddenException quando usuário não é owner', async () => {
      const params: DeleteBoardParamsDto = { id: 'board-123' };
      const userId = 'not-owner';

      repository.findById.mockResolvedValue(mockBoard);

      await expect(useCase.execute(params, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deve logar antes e depois da deleção', async () => {
      const params: DeleteBoardParamsDto = { id: 'board-123' };
      const userId = 'owner-123';

      repository.findById.mockResolvedValue(mockBoard);
      repository.delete.mockResolvedValue(undefined);

      await useCase.execute(params, userId);

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Deleting board'),
      );
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('deleted successfully'),
      );
    });
  });
});
