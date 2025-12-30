import {
  RemoveMemberParamsDto,
  UpdateMemberRoleInputDto,
  UpdateMemberRoleParamsDto,
} from '@modules/boards/dto/board.dto';
import { BoardRepositoryInterface } from '@modules/boards/interfaces/board.repository.interface';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BoardRoleEnum } from '@shared/modules/database/entities/board-member.entity';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import {
  AddMemberInputDto,
  AddMemberParamsDto,
} from './dto/manage-members.dto';
import { ManageMembersUseCase } from './manage-members.use-case';

describe('ManageMembersUseCase', () => {
  let useCase: ManageMembersUseCase;
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

  const mockMember = {
    id: 'member-123',
    boardId: 'board-123',
    userId: 'user-123',
    role: BoardRoleEnum.MEMBER,
    joinedAt: new Date(),
    board: null as any,
    user: null as any,
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
        ManageMembersUseCase,
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

    useCase = module.get<ManageMembersUseCase>(ManageMembersUseCase);
    repository = module.get(BoardRepositoryInterface);
    logger = module.get(WinstonLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addMember', () => {
    it('deve adicionar membro quando usuário é owner', async () => {
      const params: AddMemberParamsDto = { boardId: 'board-123' };
      const input: AddMemberInputDto = {
        userId: 'new-user',
        role: BoardRoleEnum.MEMBER,
      };
      const userId = 'owner-123';

      repository.findById.mockResolvedValue(mockBoard);
      repository.findMember.mockResolvedValueOnce(null); // currentMember check
      repository.findMember.mockResolvedValueOnce(null); // existingMember check
      repository.addMember.mockResolvedValue(mockMember);

      const result = await useCase.addMember(params, input, userId);

      expect(result).toEqual({
        id: mockMember.id,
        boardId: mockMember.boardId,
        userId: mockMember.userId,
        role: mockMember.role,
        joinedAt: mockMember.joinedAt,
      });
      expect(repository.addMember).toHaveBeenCalled();
    });

    it('deve adicionar membro quando usuário é admin', async () => {
      const params: AddMemberParamsDto = { boardId: 'board-123' };
      const input: AddMemberInputDto = {
        userId: 'new-user',
        role: BoardRoleEnum.MEMBER,
      };
      const userId = 'admin-user';

      const adminMember = {
        ...mockMember,
        userId: 'admin-user',
        role: BoardRoleEnum.ADMIN,
      };

      repository.findById.mockResolvedValue(mockBoard);
      repository.findMember.mockResolvedValueOnce(adminMember);
      repository.findMember.mockResolvedValueOnce(null);
      repository.addMember.mockResolvedValue(mockMember);

      await useCase.addMember(params, input, userId);

      expect(repository.addMember).toHaveBeenCalled();
    });

    it('deve lançar ForbiddenException quando usuário não é owner nem admin', async () => {
      const params: AddMemberParamsDto = { boardId: 'board-123' };
      const input: AddMemberInputDto = {
        userId: 'new-user',
        role: BoardRoleEnum.MEMBER,
      };
      const userId = 'regular-user';

      repository.findById.mockResolvedValue(mockBoard);
      repository.findMember.mockResolvedValue({
        ...mockMember,
        role: BoardRoleEnum.MEMBER,
      });

      await expect(useCase.addMember(params, input, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deve lançar BadRequestException quando usuário já é membro', async () => {
      const params: AddMemberParamsDto = { boardId: 'board-123' };
      const input: AddMemberInputDto = {
        userId: 'existing-user',
        role: BoardRoleEnum.MEMBER,
      };
      const userId = 'owner-123';

      repository.findById.mockResolvedValue(mockBoard);
      repository.findMember.mockResolvedValueOnce(null);
      repository.findMember.mockResolvedValueOnce(mockMember);

      await expect(useCase.addMember(params, input, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve usar MEMBER como role padrão', async () => {
      const params: AddMemberParamsDto = { boardId: 'board-123' };
      const input: AddMemberInputDto = { userId: 'new-user' };
      const userId = 'owner-123';

      repository.findById.mockResolvedValue(mockBoard);
      repository.findMember.mockResolvedValueOnce(null);
      repository.findMember.mockResolvedValueOnce(null);
      repository.addMember.mockResolvedValue(mockMember);

      await useCase.addMember(params, input, userId);

      expect(repository.addMember).toHaveBeenCalledWith(
        expect.any(String),
        params.boardId,
        input.userId,
        BoardRoleEnum.MEMBER,
      );
    });
  });

  describe('removeMember', () => {
    it('deve remover membro quando usuário é owner', async () => {
      const params: RemoveMemberParamsDto = {
        boardId: 'board-123',
        userId: 'user-to-remove',
      };
      const userId = 'owner-123';

      repository.findById.mockResolvedValue(mockBoard);
      repository.findMember.mockResolvedValue(null);
      repository.removeMember.mockResolvedValue(undefined);

      await useCase.removeMember(params, userId);

      expect(repository.removeMember).toHaveBeenCalledWith(
        params.boardId,
        params.userId,
      );
    });

    it('deve permitir que membro remova a si mesmo', async () => {
      const params: RemoveMemberParamsDto = {
        boardId: 'board-123',
        userId: 'user-123',
      };
      const userId = 'user-123';

      repository.findById.mockResolvedValue(mockBoard);
      repository.findMember.mockResolvedValue(mockMember);
      repository.removeMember.mockResolvedValue(undefined);

      await useCase.removeMember(params, userId);

      expect(repository.removeMember).toHaveBeenCalled();
    });

    it('deve lançar BadRequestException ao tentar remover owner', async () => {
      const params: RemoveMemberParamsDto = {
        boardId: 'board-123',
        userId: 'owner-123',
      };
      const userId = 'owner-123';

      repository.findById.mockResolvedValue(mockBoard);

      await expect(useCase.removeMember(params, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar ForbiddenException quando usuário não tem permissão', async () => {
      const params: RemoveMemberParamsDto = {
        boardId: 'board-123',
        userId: 'user-to-remove',
      };
      const userId = 'unauthorized-user';

      repository.findById.mockResolvedValue(mockBoard);
      repository.findMember.mockResolvedValue({
        ...mockMember,
        role: BoardRoleEnum.MEMBER,
      });

      await expect(useCase.removeMember(params, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateMemberRole', () => {
    it('deve atualizar role quando usuário é owner', async () => {
      const params: UpdateMemberRoleParamsDto = {
        boardId: 'board-123',
        userId: 'user-123',
      };
      const input: UpdateMemberRoleInputDto = { role: BoardRoleEnum.ADMIN };
      const userId = 'owner-123';

      const updatedMember = { ...mockMember, role: BoardRoleEnum.ADMIN };

      repository.findById.mockResolvedValue(mockBoard);
      repository.updateMemberRole.mockResolvedValue(updatedMember);

      const result = await useCase.updateMemberRole(params, input, userId);

      expect(result.role).toBe(BoardRoleEnum.ADMIN);
      expect(repository.updateMemberRole).toHaveBeenCalledWith(
        params.boardId,
        params.userId,
        input.role,
      );
    });

    it('deve lançar ForbiddenException quando usuário não é owner', async () => {
      const params: UpdateMemberRoleParamsDto = {
        boardId: 'board-123',
        userId: 'user-123',
      };
      const input: UpdateMemberRoleInputDto = { role: BoardRoleEnum.ADMIN };
      const userId = 'not-owner';

      repository.findById.mockResolvedValue(mockBoard);

      await expect(
        useCase.updateMemberRole(params, input, userId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar BadRequestException ao tentar mudar role do owner', async () => {
      const params: UpdateMemberRoleParamsDto = {
        boardId: 'board-123',
        userId: 'owner-123',
      };
      const input: UpdateMemberRoleInputDto = { role: BoardRoleEnum.MEMBER };
      const userId = 'owner-123';

      repository.findById.mockResolvedValue(mockBoard);

      await expect(
        useCase.updateMemberRole(params, input, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar NotFoundException quando board não existe', async () => {
      const params: UpdateMemberRoleParamsDto = {
        boardId: 'non-existent',
        userId: 'user-123',
      };
      const input: UpdateMemberRoleInputDto = { role: BoardRoleEnum.ADMIN };
      const userId = 'owner-123';

      repository.findById.mockResolvedValue(null);

      await expect(
        useCase.updateMemberRole(params, input, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
