import { BoardRepositoryInterface } from '@modules/boards/interfaces/board.repository.interface';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import {
  UpdateBoardInputDto,
  UpdateBoardParamsDto,
} from './dto/update-board.dto';
import { UpdateBoardUseCase } from './update-board.use-case';

describe('UpdateBoardUseCase', () => {
  let useCase: UpdateBoardUseCase;
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
        UpdateBoardUseCase,
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

    useCase = module.get<UpdateBoardUseCase>(UpdateBoardUseCase);
    repository = module.get(BoardRepositoryInterface);
    logger = module.get(WinstonLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve atualizar board quando usuário é owner', async () => {
      const params: UpdateBoardParamsDto = { id: 'board-123' };
      const input: UpdateBoardInputDto = {
        name: 'Updated Board',
        description: 'Updated Description',
      };
      const userId = 'owner-123';

      repository.findById.mockResolvedValue(mockBoard);
      repository.update.mockResolvedValue({ ...mockBoard, ...input });

      const result = await useCase.execute(params, input, userId);

      expect(result.name).toBe(input.name);
      expect(result.description).toBe(input.description);
      expect(repository.update).toHaveBeenCalledWith(params.id, input);
    });

    it('deve lançar NotFoundException quando board não existe', async () => {
      const params: UpdateBoardParamsDto = { id: 'non-existent' };
      const input: UpdateBoardInputDto = { name: 'Updated' };
      const userId = 'owner-123';

      repository.findById.mockResolvedValue(null);

      await expect(useCase.execute(params, input, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar ForbiddenException quando usuário não é owner', async () => {
      const params: UpdateBoardParamsDto = { id: 'board-123' };
      const input: UpdateBoardInputDto = { name: 'Updated' };
      const userId = 'not-owner';

      repository.findById.mockResolvedValue(mockBoard);

      await expect(useCase.execute(params, input, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deve logar antes e depois da atualização', async () => {
      const params: UpdateBoardParamsDto = { id: 'board-123' };
      const input: UpdateBoardInputDto = { name: 'Updated' };
      const userId = 'owner-123';

      repository.findById.mockResolvedValue(mockBoard);
      repository.update.mockResolvedValue({ ...mockBoard, ...input });

      await useCase.execute(params, input, userId);

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Updating board'),
      );
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('updated successfully'),
      );
    });
  });
});
