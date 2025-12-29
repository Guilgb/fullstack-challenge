import { Injectable } from '@nestjs/common';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { BoardRepositoryInterface } from '../../interfaces/board.repository.interface';
import {
  ListBoardsQueryDto,
  ListBoardsResponseDto,
} from './dto/list-boards.dto';

@Injectable()
export class ListBoardsUseCase {
  constructor(
    private readonly boardRepository: BoardRepositoryInterface,
    private readonly logger: WinstonLoggerService,
  ) {}

  async execute(
    query: ListBoardsQueryDto,
    userId: string,
  ): Promise<ListBoardsResponseDto> {
    this.logger.log(`Listing boards for user: ${userId}`);

    const result = await this.boardRepository.findAllByUserId(userId, query);

    return {
      data: result.data.map(board => ({
        id: board.id,
        name: board.name,
        description: board.description,
        ownerId: board.ownerId,
        members:
          board.members?.map(m => ({
            id: m.id,
            userId: m.userId,
            role: m.role,
            joinedAt: m.joinedAt,
          })) || [],
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
      })),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };
  }
}
