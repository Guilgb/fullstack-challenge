import { BadRequestException, Injectable } from '@nestjs/common';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { randomUUID } from 'crypto';
import { TaskRepositoryInterface } from '../../interfaces/task.repository.interface';
import { CreateTaskInputDto, CreateTaskOutputDto } from './dto/create.dto';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    private readonly winstonLoggerService: WinstonLoggerService,
    private readonly createTaskRepository: TaskRepositoryInterface,
  ) {}
  async execute(input: CreateTaskInputDto): Promise<CreateTaskOutputDto> {
    try {
      const taskId = randomUUID();
      this.winstonLoggerService.log(
        `Criando task com ID: ${taskId}`,
        'CreateTaskUseCase',
        { ...input },
      );
      const task = await this.createTaskRepository.create(input, taskId);
      this.winstonLoggerService.log(
        `Task criada com sucesso: ${taskId}`,
        'CreateTaskUseCase',
        { id: task.id },
      );
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        deadline: task.deadline,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.winstonLoggerService.error(
        `Erro ao criar task: ${error.message}`,
        error.stack,
        'CreateTaskUseCase',
        { ...input, errorCode: error.code },
      );

      throw new BadRequestException('Falha ao criar task');
    }
  }
}
