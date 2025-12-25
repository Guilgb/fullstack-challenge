import { BadRequestException, Injectable } from '@nestjs/common';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { TaskRepositoryInterface } from '../../interfaces/task.repository.interface';
import { UpdateTaskInputDto, UpdateTaskParamsDto } from './dto/update.task.dto';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepositoryInterface,
    private readonly winstonLoggerService: WinstonLoggerService,
  ) {}
  async execute(id: UpdateTaskParamsDto, input: UpdateTaskInputDto) {
    try {
      this.winstonLoggerService.log(
        `Atualizando task com id: ${id.id}`,
        null,
        'UpdateTaskUseCase',
      );

      const updatedTask = await this.taskRepository.update(id, input);

      this.winstonLoggerService.log(
        `Task atualizada com sucesso: ${updatedTask.id}`,
        null,
        'UpdateTaskUseCase',
      );

      return {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        deadLine: updatedTask.deadline,
        createdAt: updatedTask.createdAt,
        updatedAt: updatedTask.updatedAt,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.winstonLoggerService.error(
        `Erro ao atualizar task: ${error.message}`,
        error.stack,
        'UpdateTaskUseCase',
        { ...input, errorCode: error.code },
      );

      throw new BadRequestException('Falha ao atualizar task');
    }
  }
}
