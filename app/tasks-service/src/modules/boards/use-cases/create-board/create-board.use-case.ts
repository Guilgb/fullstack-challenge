import { Injectable } from '@nestjs/common';
import { BoardRoleEnum } from '@shared/modules/database/entities/board-member.entity';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { randomUUID } from 'crypto';
import { BoardRepositoryInterface } from '../../interfaces/board.repository.interface';
import {
  CreateBoardInputDto,
  CreateBoardOutputDto,
} from './dto/create-board.dto';

@Injectable()
export class CreateBoardUseCase {
  constructor(
    private readonly boardRepository: BoardRepositoryInterface,
    private readonly logger: WinstonLoggerService,
  ) {}

  async execute(
    input: CreateBoardInputDto,
    userId: string,
  ): Promise<CreateBoardOutputDto> {
    this.logger.log(`Creating board: ${input.name} for user: ${userId}`);

    const boardId = randomUUID();
    const board = await this.boardRepository.create(input, boardId, userId);

    const memberId = randomUUID();
    await this.boardRepository.addMember(
      memberId,
      boardId,
      userId,
      BoardRoleEnum.OWNER,
    );

    this.logger.log(`Board created successfully: ${boardId}`);

    return {
      id: board.id,
      name: board.name,
      description: board.description,
      ownerId: board.ownerId,
      createdAt: board.createdAt,
    };
  }
}
