import { TaskEntity } from '@shared/modules/database/entities';
import { CreateTaskInputDto } from '../use-cases/create/dto/create.dto';
import {
  UpdateTaskInputDto,
  UpdateTaskParamsDto,
} from '../use-cases/update/dto/update.task.dto';

export interface PaginationOptions {
  page: number;
  pageSize: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  boardId?: string;
  userId?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export abstract class TaskRepositoryInterface {
  abstract create(
    input: CreateTaskInputDto,
    taskId: string,
    createdBy: string,
  ): Promise<TaskEntity>;
  abstract findById(id: string): Promise<TaskEntity | null>;
  abstract update(
    id: UpdateTaskParamsDto,
    input: UpdateTaskInputDto,
  ): Promise<TaskEntity>;
  abstract delete(id: string): Promise<void>;
  abstract findAllPaginated(
    options: PaginationOptions,
  ): Promise<PaginatedResult<TaskEntity>>;
  abstract findByBoardId(
    boardId: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<TaskEntity>>;
}
