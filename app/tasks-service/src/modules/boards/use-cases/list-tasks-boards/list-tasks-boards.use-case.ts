import { BoardRepositoryInterface } from '@modules/boards/interfaces/board.repository.interface';
import { Injectable } from '@nestjs/common';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import {
  ListTasksBoardsQueryDto,
  ListTasksBoardsResponseDto,
} from './dto/list-tasks-boards.dto';

@Injectable()
export class ListTasksBoardsUseCase {
  constructor(
    private readonly logger: WinstonLoggerService,
    private readonly boardRepository: BoardRepositoryInterface,
  ) {}

  async execute(
    query: ListTasksBoardsQueryDto,
  ): Promise<ListTasksBoardsResponseDto> {
    try {
      this.logger.log(
        `Listing tasks for board: ${query.boardId}, page: ${query.page}, pageSize: ${query.pageSize}`,
      );

      const result = await this.boardRepository.findAllTasksByBoardId(query);

      this.logger.log(`Found ${result.total} tasks for board ${query.boardId}`);

      return result;
    } catch (error) {
      this.logger.error('Error in ListTasksBoardsUseCase.execute', error);
      throw error;
    }
  }
}
