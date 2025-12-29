import {
  BoardEntity,
  BoardMemberEntity,
} from '@shared/modules/database/entities';
import { BoardRoleEnum } from '@shared/modules/database/entities/board-member.entity';
import { CreateBoardInputDto } from '../use-cases/create-board/dto/create-board.dto';
import { ListBoardsQueryDto } from '../use-cases/list-boards/dto/list-boards.dto';
import { UpdateBoardInputDto } from '../use-cases/update-board/dto/update-board.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export abstract class BoardRepositoryInterface {
  abstract create(
    input: CreateBoardInputDto,
    boardId: string,
    ownerId: string,
  ): Promise<BoardEntity>;

  abstract findById(id: string): Promise<BoardEntity | null>;

  abstract findByIdWithMembers(id: string): Promise<BoardEntity | null>;

  abstract update(id: string, input: UpdateBoardInputDto): Promise<BoardEntity>;

  abstract delete(id: string): Promise<void>;

  abstract findAllByUserId(
    userId: string,
    options: ListBoardsQueryDto,
  ): Promise<PaginatedResult<BoardEntity>>;

  abstract addMember(
    memberId: string,
    boardId: string,
    userId: string,
    role: BoardRoleEnum,
  ): Promise<BoardMemberEntity>;

  abstract removeMember(boardId: string, userId: string): Promise<void>;

  abstract findMember(
    boardId: string,
    userId: string,
  ): Promise<BoardMemberEntity | null>;

  abstract updateMemberRole(
    boardId: string,
    userId: string,
    role: BoardRoleEnum,
  ): Promise<BoardMemberEntity>;

  abstract isMember(boardId: string, userId: string): Promise<boolean>;
}
