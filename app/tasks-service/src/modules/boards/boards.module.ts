import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BoardEntity,
  BoardMemberEntity,
} from '@shared/modules/database/entities';
import { WinstonModule } from '@shared/modules/winston/winston.module';
import { BoardsController } from './boards.controller';
import { BoardRepositoryInterface } from './interfaces/board.repository.interface';
import { BoardRepository } from './repository/board.repository';
import {
  CreateBoardUseCase,
  DeleteBoardUseCase,
  GetBoardUseCase,
  ListBoardsUseCase,
  ManageMembersUseCase,
  UpdateBoardUseCase,
} from './use-cases';

@Module({
  imports: [
    TypeOrmModule.forFeature([BoardEntity, BoardMemberEntity]),
    WinstonModule,
  ],
  controllers: [BoardsController],
  providers: [
    CreateBoardUseCase,
    GetBoardUseCase,
    ListBoardsUseCase,
    UpdateBoardUseCase,
    DeleteBoardUseCase,
    ManageMembersUseCase,
    { provide: BoardRepositoryInterface, useClass: BoardRepository },
  ],
  exports: [BoardRepositoryInterface],
})
export class BoardsModule {}
