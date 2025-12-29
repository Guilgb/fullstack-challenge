import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { BoardRepositoryInterface } from '../../interfaces/board.repository.interface';
import {
  UpdateBoardInputDto,
  UpdateBoardOutputDto,
  UpdateBoardParamsDto,
} from './dto/update-board.dto';

@Injectable()
export class UpdateBoardUseCase {
  constructor(
    private readonly boardRepository: BoardRepositoryInterface,
    private readonly logger: WinstonLoggerService,
  ) {}

  async execute(
    params: UpdateBoardParamsDto,
    input: UpdateBoardInputDto,
    userId: string,
  ): Promise<UpdateBoardOutputDto> {
    this.logger.log(`Updating board: ${params.id}`);

    const board = await this.boardRepository.findById(params.id);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Only owner can update board
    if (board.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can update this board');
    }

    const updatedBoard = await this.boardRepository.update(params.id, input);

    this.logger.log(`Board updated successfully: ${params.id}`);

    return {
      id: updatedBoard.id,
      name: updatedBoard.name,
      description: updatedBoard.description,
      ownerId: updatedBoard.ownerId,
      createdAt: updatedBoard.createdAt,
    };
  }
}
