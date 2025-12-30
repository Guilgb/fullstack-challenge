import { Test, TestingModule } from '@nestjs/testing';
import { BoardRoleEnum } from '@shared/modules/database/entities/board-member.entity';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { BoardRepositoryInterface } from '../../interfaces/board.repository.interface';
import { CreateBoardUseCase } from './create-board.use-case';
import { CreateBoardInputDto } from './dto/create-board.dto';

describe('CreateBoardUseCase', () => {
  let useCase: CreateBoardUseCase;
  let repository: jest.Mocked<BoardRepositoryInterface>;
  let logger: jest.Mocked<WinstonLoggerService>;

  const mockBoard = {
    id: 'board-123',
    name: 'Test Board',
    description: 'Test Description',
    ownerId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    members: [],
    tasks: [],
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      addMember: jest.fn(),
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateBoardUseCase,
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

    useCase = module.get<CreateBoardUseCase>(CreateBoardUseCase);
    repository = module.get(BoardRepositoryInterface);
    logger = module.get(WinstonLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve criar um board com sucesso', async () => {
      const input: CreateBoardInputDto = {
        name: 'Test Board',
        description: 'Test Description',
      };

      const userId = 'user-123';

      repository.create.mockResolvedValue(mockBoard);
      repository.addMember.mockResolvedValue(undefined);

      const result = await useCase.execute(input, userId);

      expect(result).toEqual({
        id: mockBoard.id,
        name: mockBoard.name,
        description: mockBoard.description,
        ownerId: mockBoard.ownerId,
        createdAt: mockBoard.createdAt,
      });

      expect(repository.create).toHaveBeenCalledWith(
        input,
        expect.any(String),
        userId,
      );
      expect(logger.log).toHaveBeenCalledTimes(2);
    });

    it('deve gerar UUID para o novo board', async () => {
      const input: CreateBoardInputDto = {
        name: 'Test Board',
        description: 'Test Description',
      };

      repository.create.mockResolvedValue(mockBoard);
      repository.addMember.mockResolvedValue(undefined);

      await useCase.execute(input, 'user-123');

      expect(repository.create).toHaveBeenCalledWith(
        input,
        expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ),
        'user-123',
      );
    });

    it('deve adicionar o criador como membro OWNER', async () => {
      const input: CreateBoardInputDto = {
        name: 'Test Board',
        description: 'Test Description',
      };

      const userId = 'user-123';

      repository.create.mockResolvedValue(mockBoard);
      repository.addMember.mockResolvedValue(undefined);

      await useCase.execute(input, userId);

      expect(repository.addMember).toHaveBeenCalledWith(
        expect.any(String), // memberId
        expect.any(String), // boardId
        userId,
        BoardRoleEnum.OWNER,
      );
    });

    it('deve gerar UUID único para o membro', async () => {
      const input: CreateBoardInputDto = {
        name: 'Test Board',
        description: 'Test Description',
      };

      repository.create.mockResolvedValue(mockBoard);
      repository.addMember.mockResolvedValue(undefined);

      await useCase.execute(input, 'user-123');

      expect(repository.addMember).toHaveBeenCalledWith(
        expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ),
        expect.any(String),
        expect.any(String),
        BoardRoleEnum.OWNER,
      );
    });

    it('deve logar informações durante a criação', async () => {
      const input: CreateBoardInputDto = {
        name: 'Test Board',
        description: 'Test Description',
      };

      const userId = 'user-123';

      repository.create.mockResolvedValue(mockBoard);
      repository.addMember.mockResolvedValue(undefined);

      await useCase.execute(input, userId);

      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('Creating board'),
      );

      expect(logger.log).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('Board created successfully'),
      );
    });

    it('deve propagar erros do repositório', async () => {
      const input: CreateBoardInputDto = {
        name: 'Test Board',
        description: 'Test Description',
      };

      const error = new Error('Database error');
      repository.create.mockRejectedValue(error);

      await expect(useCase.execute(input, 'user-123')).rejects.toThrow(error);
    });

    it('deve falhar se addMember lançar erro', async () => {
      const input: CreateBoardInputDto = {
        name: 'Test Board',
        description: 'Test Description',
      };

      repository.create.mockResolvedValue(mockBoard);

      const error = new Error('Failed to add member');
      repository.addMember.mockRejectedValue(error);

      await expect(useCase.execute(input, 'user-123')).rejects.toThrow(error);
    });
  });
});
