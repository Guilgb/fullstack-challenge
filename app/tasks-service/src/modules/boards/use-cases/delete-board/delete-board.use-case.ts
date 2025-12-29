import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { BoardRepositoryInterface } from '../../interfaces/board.repository.interface';
import { DeleteBoardParamsDto } from './dto/delete-board.dto';

@Injectable()
export class DeleteBoardUseCase {
  constructor(
    private readonly boardRepository: BoardRepositoryInterface,
    private readonly logger: WinstonLoggerService,
  ) {}

  async execute(params: DeleteBoardParamsDto, userId: string): Promise<void> {
    this.logger.log(`Deleting board: ${params.id}`);

    const board = await this.boardRepository.findById(params.id);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can delete this board');
    }

    await this.boardRepository.delete(params.id);

    this.logger.log(`Board deleted successfully: ${params.id}`);
  }
}
