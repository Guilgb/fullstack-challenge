import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BoardEntity,
  BoardMemberEntity,
  TaskEntity,
} from '@shared/modules/database/entities';
import { BoardRoleEnum } from '@shared/modules/database/entities/board-member.entity';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { Repository } from 'typeorm';
import {
  BoardRepositoryInterface,
  PaginatedResult,
} from '../interfaces/board.repository.interface';
import { CreateBoardInputDto } from '../use-cases/create-board/dto/create-board.dto';
import { ListBoardsQueryDto } from '../use-cases/list-boards/dto/list-boards.dto';
import {
  ListTasksBoardsQueryDto,
  ListTasksBoardsResponseDto,
} from '../use-cases/list-tasks-boards/dto/list-tasks-boards.dto';
import { UpdateBoardInputDto } from '../use-cases/update-board/dto/update-board.dto';

@Injectable()
export class BoardRepository implements BoardRepositoryInterface {
  constructor(
    @InjectRepository(BoardEntity)
    private readonly boardRepository: Repository<BoardEntity>,
    @InjectRepository(BoardMemberEntity)
    private readonly boardMemberRepository: Repository<BoardMemberEntity>,
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    private readonly logger: WinstonLoggerService,
  ) {}

  async create(
    input: CreateBoardInputDto,
    boardId: string,
    ownerId: string,
  ): Promise<BoardEntity> {
    try {
      const board = this.boardRepository.create({
        ...input,
        id: boardId,
        ownerId,
      });
      return await this.boardRepository.save(board);
    } catch (error) {
      this.logger.error('Error in BoardRepository.create', error);
      throw error;
    }
  }

  async findById(id: string): Promise<BoardEntity | null> {
    try {
      return await this.boardRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error('Error in BoardRepository.findById', error);
      throw error;
    }
  }

  async findByIdWithMembers(id: string): Promise<BoardEntity | null> {
    try {
      return await this.boardRepository.findOne({
        where: { id },
        relations: ['members'],
      });
    } catch (error) {
      this.logger.error('Error in BoardRepository.findByIdWithMembers', error);
      throw error;
    }
  }

  async update(id: string, input: UpdateBoardInputDto): Promise<BoardEntity> {
    try {
      const board = await this.findById(id);
      if (!board) {
        throw new Error('Board not found');
      }

      Object.assign(board, input);
      return await this.boardRepository.save(board);
    } catch (error) {
      this.logger.error('Error in BoardRepository.update', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const board = await this.findById(id);
      if (!board) {
        throw new Error('Board not found');
      }
      await this.boardRepository.delete(id);
    } catch (error) {
      this.logger.error('Error in BoardRepository.delete', error);
      throw error;
    }
  }

  async findAllByUserId(
    userId: string,
    options: ListBoardsQueryDto,
  ): Promise<PaginatedResult<BoardEntity>> {
    try {
      const { page = 1, pageSize = 10 } = options;

      const queryBuilder = this.boardRepository
        .createQueryBuilder('board')
        .leftJoinAndSelect('board.members', 'members')
        .where('board.ownerId = :userId', { userId })
        .orWhere('members.userId = :userId', { userId })
        .orderBy('board.createdAt', 'DESC')
        .skip((page - 1) * pageSize)
        .take(pageSize);

      const [data, total] = await queryBuilder.getManyAndCount();
      const totalPages = Math.ceil(total / pageSize);

      return {
        data,
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      this.logger.error('Error in BoardRepository.findAllByUserId', error);
      throw error;
    }
  }

  async findAllTasksByBoardId(
    query: ListTasksBoardsQueryDto,
  ): Promise<ListTasksBoardsResponseDto> {
    try {
      const { boardId, page = 1, pageSize = 10 } = query;

      const [tasks, total] = await this.taskRepository.findAndCount({
        where: { boardId },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      const totalPages = Math.ceil(total / pageSize);

      return {
        data: tasks,
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      this.logger.error(
        'Error in BoardRepository.findAllTasksByBoardId',
        error,
      );
      throw error;
    }
  }

  async addMember(
    memberId: string,
    boardId: string,
    userId: string,
    role: BoardRoleEnum,
  ): Promise<BoardMemberEntity> {
    try {
      const member = this.boardMemberRepository.create({
        id: memberId,
        boardId,
        userId,
        role,
      });
      return await this.boardMemberRepository.save(member);
    } catch (error) {
      this.logger.error('Error in BoardRepository.addMember', error);
      throw error;
    }
  }

  async removeMember(boardId: string, userId: string): Promise<void> {
    try {
      await this.boardMemberRepository.delete({ boardId, userId });
    } catch (error) {
      this.logger.error('Error in BoardRepository.removeMember', error);
      throw error;
    }
  }

  async findMember(
    boardId: string,
    userId: string,
  ): Promise<BoardMemberEntity | null> {
    try {
      return await this.boardMemberRepository.findOne({
        where: { boardId, userId },
      });
    } catch (error) {
      this.logger.error('Error in BoardRepository.findMember', error);
      throw error;
    }
  }

  async updateMemberRole(
    boardId: string,
    userId: string,
    role: BoardRoleEnum,
  ): Promise<BoardMemberEntity> {
    try {
      const member = await this.findMember(boardId, userId);
      if (!member) {
        throw new Error('Member not found');
      }

      member.role = role;
      return await this.boardMemberRepository.save(member);
    } catch (error) {
      this.logger.error('Error in BoardRepository.updateMemberRole', error);
      throw error;
    }
  }

  async isMember(boardId: string, userId: string): Promise<boolean> {
    try {
      const board = await this.findById(boardId);
      if (!board) return false;

      if (board.ownerId === userId) return true;

      const member = await this.findMember(boardId, userId);
      return !!member;
    } catch (error) {
      this.logger.error('Error in BoardRepository.isMember', error);
      throw error;
    }
  }
}
