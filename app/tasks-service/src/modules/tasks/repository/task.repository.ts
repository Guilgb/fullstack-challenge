import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from '@shared/modules/database/entities';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { Repository } from 'typeorm';
import {
  PaginatedResult,
  PaginationOptions,
  TaskRepositoryInterface,
} from '../interfaces/task.repository.interface';
import { CreateTaskInputDto } from '../use-cases/create/dto/create.dto';
import {
  UpdateTaskInputDto,
  UpdateTaskParamsDto,
} from '../use-cases/update/dto/update.task.dto';

@Injectable()
export class TaskRepository implements TaskRepositoryInterface {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    private readonly winstonLoggerService: WinstonLoggerService,
  ) {}

  async create(
    input: CreateTaskInputDto,
    taskId: string,
    createdBy: string,
  ): Promise<TaskEntity> {
    try {
      const taskCreated = this.taskRepository.create({
        ...input,
        id: taskId,
        priority: input.priority,
        createdBy,
        boardId: input.boardId,
        assignedTo: input.assignedTo,
      });
      return this.taskRepository.save(taskCreated);
    } catch (error) {
      this.winstonLoggerService.error('Error in TaskRepository.create', error);
      throw error;
    }
  }

  async findById(id: string): Promise<TaskEntity | null> {
    try {
      const task = await this.taskRepository.findOne({
        where: { id },
      });
      return task || null;
    } catch (error) {
      this.winstonLoggerService.error(
        'Error in TaskRepository.findById',
        error,
      );
      throw error;
    }
  }

  async update(
    param: UpdateTaskParamsDto,
    input: UpdateTaskInputDto,
  ): Promise<TaskEntity> {
    try {
      const task = await this.findById(param.id);

      if (!task) {
        throw new Error('Task not found');
      }

      Object.assign(task, input);

      const updatedTask = await this.taskRepository.save(task);
      return updatedTask;
    } catch (error) {
      this.winstonLoggerService.error('Error in TaskRepository.update', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const findTask = await this.taskRepository.findOne({ where: { id } });

      if (!findTask) {
        throw new Error('Task not found');
      }
      await this.taskRepository.delete(findTask);
    } catch (error) {
      this.winstonLoggerService.error('Error in TaskRepository.delete', error);
      throw error;
    }
  }

  async findAllPaginated(
    options: PaginationOptions,
  ): Promise<PaginatedResult<TaskEntity>> {
    try {
      const {
        page = 1,
        pageSize = 10,
        orderBy = 'createdAt',
        orderDirection = 'DESC',
        boardId,
        userId,
      } = options;

      const whereConditions: Record<string, unknown> = {};
      if (boardId) {
        whereConditions.boardId = boardId;
      }
      if (userId) {
        whereConditions.createdBy = userId;
      }

      const [data, total] = await this.taskRepository.findAndCount({
        where:
          Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
        skip: (page - 1) * pageSize,
        take: pageSize,
        order: { [orderBy]: orderDirection },
      });

      const totalPages = Math.ceil(total / pageSize);

      return {
        data,
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      this.winstonLoggerService.error(
        'Error in TaskRepository.findAllPaginated',
        error,
      );
      throw error;
    }
  }

  async findByBoardId(
    boardId: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<TaskEntity>> {
    try {
      const {
        page = 1,
        pageSize = 10,
        orderBy = 'createdAt',
        orderDirection = 'DESC',
      } = options;

      const [data, total] = await this.taskRepository.findAndCount({
        where: { boardId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        order: { [orderBy]: orderDirection },
      });

      const totalPages = Math.ceil(total / pageSize);

      return {
        data,
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      this.winstonLoggerService.error(
        'Error in TaskRepository.findByBoardId',
        error,
      );
      throw error;
    }
  }
}
