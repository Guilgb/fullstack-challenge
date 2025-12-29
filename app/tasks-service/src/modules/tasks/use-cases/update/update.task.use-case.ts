import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { EventsService } from '../../../../shared/services/events.service';
import { TaskRepositoryInterface } from '../../interfaces/task.repository.interface';
import { UpdateTaskInputDto, UpdateTaskParamsDto } from './dto/update.task.dto';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepositoryInterface,
    private readonly winstonLoggerService: WinstonLoggerService,
    private readonly eventsService: EventsService,
  ) {}
  async execute(
    id: UpdateTaskParamsDto,
    input: UpdateTaskInputDto,
    userId?: string,
  ) {
    try {
      this.winstonLoggerService.log(
        `Atualizando task com id: ${id.id}`,
        null,
        'UpdateTaskUseCase',
      );

      const existingTask = await this.taskRepository.findById(id.id);
      if (!existingTask) {
        throw new NotFoundException('Task não encontrada');
      }

      const previousStatus = existingTask.status;
      const previousAssignedTo = existingTask.assignedTo;

      const updatedTask = await this.taskRepository.update(id, input);

      this.winstonLoggerService.log(
        `Task atualizada com sucesso: ${updatedTask.id}`,
        null,
        'UpdateTaskUseCase',
      );

      if (
        input.assignedTo &&
        input.assignedTo !== previousAssignedTo &&
        input.assignedTo !== userId
      ) {
        await this.eventsService.publishTaskAssigned({
          taskId: updatedTask.id,
          taskTitle: updatedTask.title,
          userId: userId || 'system',
          assignedTo: input.assignedTo,
        });
      }

      if (input.status && input.status !== previousStatus) {
        const participants: string[] = [];
        if (updatedTask.assignedTo && updatedTask.assignedTo !== userId) {
          participants.push(updatedTask.assignedTo);
        }
        if (
          updatedTask.createdBy &&
          updatedTask.createdBy !== userId &&
          updatedTask.createdBy !== updatedTask.assignedTo
        ) {
          participants.push(updatedTask.createdBy);
        }

        if (participants.length > 0) {
          await this.eventsService.publishTaskStatusChanged({
            taskId: updatedTask.id,
            taskTitle: updatedTask.title,
            userId: userId || 'system',
            previousStatus,
            newStatus: input.status,
            participants,
          });
        }
      }

      await this.eventsService.publishTaskUpdated({
        taskId: updatedTask.id,
        taskTitle: updatedTask.title,
        userId: userId || 'system',
      });

      return {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        status: updatedTask.status,
        deadLine: updatedTask.deadline,
        createdAt: updatedTask.createdAt,
        updatedAt: updatedTask.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
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
