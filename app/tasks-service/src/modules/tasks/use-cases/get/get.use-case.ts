import { TaskRepositoryInterface } from '@modules/tasks/interfaces/task.repository.interface';
import { BadRequestException, Injectable } from '@nestjs/common';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { GetTaskParamsDto, TaskResponseDto } from './dto/get.dto';

@Injectable()
export class GetTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepositoryInterface,
    private readonly winstonLoggerService: WinstonLoggerService,
  ) {}
  async execute(params: GetTaskParamsDto): Promise<TaskResponseDto> {
    try {
      const task = await this.taskRepository.findById(params.id);
      if (!task) {
        this.winstonLoggerService.warn(
          `Task com id ${params.id} não encontrada`,
          'GetTaskUseCase',
        );
        throw new BadRequestException('Task não encontrada');
      }

      this.winstonLoggerService.log(
        `Task com id ${params.id} encontrada com sucesso`,
        'GetTaskUseCase',
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
        `Erro ao listar tasks: ${error.message}`,
        error.stack,
        'ListTasksUseCase',
        { ...params, errorCode: error.code },
      );

      throw new BadRequestException('Falha ao listar tasks');
    }
  }
}
