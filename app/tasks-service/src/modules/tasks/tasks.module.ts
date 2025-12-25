import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from '@shared/modules/database/entities';
import { WinstonModule } from '@shared/modules/winston/winston.module';
import { TaskRepositoryInterface } from './interfaces/task.repository.interface';
import { TaskRepository } from './repository/task.repository';
import { TasksController } from './tasks.controller';
import { CreateTaskUseCase } from './use-cases/create/create.use-case';
import { DeleteTaskUseCase } from './use-cases/delete/delete.use-case';
import { GetTaskUseCase } from './use-cases/get/get.use-case';
import { ListTasksUseCase } from './use-cases/list/list.use-case';
import { UpdateTaskUseCase } from './use-cases/update/update.task.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity]), WinstonModule],
  controllers: [TasksController],
  providers: [
    CreateTaskUseCase,
    GetTaskUseCase,
    ListTasksUseCase,
    DeleteTaskUseCase,
    UpdateTaskUseCase,
    { provide: TaskRepositoryInterface, useClass: TaskRepository },
  ],
  exports: [],
})
export class TasksModule {}
