import { Injectable, NotFoundException } from '@nestjs/common';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { BoardRepositoryInterface } from '../../interfaces/board.repository.interface';
import { BoardResponseDto, GetBoardParamsDto } from './dto/get-board.dto';

@Injectable()
export class GetBoardUseCase {
  constructor(
    private readonly boardRepository: BoardRepositoryInterface,
    private readonly logger: WinstonLoggerService,
  ) {}

  async execute(
    params: GetBoardParamsDto,
    userId: string,
  ): Promise<BoardResponseDto> {
    this.logger.log(`Getting board: ${params.id}`);

    const board = await this.boardRepository.findByIdWithMembers(params.id);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const isMember = await this.boardRepository.isMember(params.id, userId);
    if (!isMember) {
      throw new NotFoundException('Board not found');
    }

    return {
      id: board.id,
      name: board.name,
      description: board.description,
      ownerId: board.ownerId,
      members:
        board.members?.map(m => ({
          id: m.id,
          userId: m.userId,
          username: m.user.username,
          role: m.role,
          joinedAt: m.joinedAt,
        })) || [],
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    };
  }
}
