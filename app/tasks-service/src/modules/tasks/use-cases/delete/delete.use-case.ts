import { BadRequestException, Injectable } from '@nestjs/common';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { EventsService } from '../../../../shared/services/events.service';
import { TaskRepositoryInterface } from '../../interfaces/task.repository.interface';
import { DeleteTaskParamsDto } from './dto/delete.dto';

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepositoryInterface,
    private readonly winstonLoggerService: WinstonLoggerService,
    private readonly eventsService: EventsService,
  ) {}

  async execute(params: DeleteTaskParamsDto, userId?: string) {
    try {
      const task = await this.taskRepository.findById(params.id);

      await this.taskRepository.delete(params.id);
      this.winstonLoggerService.log(
        `Task deletada com sucesso`,
        'DeleteTaskUseCase',
        { id: params.id },
      );

      if (task) {
        await this.eventsService.publishTaskUpdated({
          taskId: params.id,
          taskTitle: task.title || 'Task',
          userId: userId || 'system',
        });
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.winstonLoggerService.error(
        `Erro ao atualizar task: ${error.message}`,
        error.stack,
        'DeleteTaskUseCase',
        { ...params, errorCode: error.code },
      );

      throw new BadRequestException('Falha ao deletar task');
    }
  }
}
