import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from '@shared/modules/database/entities';
import { WinstonModule } from '@shared/modules/winston/winston.module';
import { TaskRepositoryInterface } from './interfaces/task.repository.interface';
import { TaskRepository } from './repository/task.repository';
import { TasksController } from './tasks.controller';
import { CreateTaskUseCase } from './use-cases/create/create.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity]), WinstonModule],
  controllers: [TasksController],
  providers: [
    CreateTaskUseCase,
    { provide: TaskRepositoryInterface, useClass: TaskRepository },
  ],
  exports: [],
})
export class TasksModule {}
