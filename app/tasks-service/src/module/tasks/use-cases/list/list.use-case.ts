import { BadRequestException, Injectable } from '@nestjs/common';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { TaskRepositoryInterface } from '../../interfaces/task.repository.interface';
import { ListTasksQueryDto, ListTasksReponseDto } from './dto/list.dto';

@Injectable()
export class ListTasksUseCase {
  constructor(
    private readonly taskRepository: TaskRepositoryInterface,
    private readonly winstonLoggerService: WinstonLoggerService,
  ) {}
  async execute(query: ListTasksQueryDto): Promise<ListTasksReponseDto> {
    try {
      const { page = 1, pageSize = 10, orderBy, orderDirection } = query;

      const result = await this.taskRepository.findAllPaginated({
        page,
        pageSize,
        orderBy,
        orderDirection,
      });

      this.winstonLoggerService.log(
        `Tasks listadas com sucesso`,
        'ListTasksUseCase',
        {
          page,
          pageSize,
          total: result.total,
          totalPages: result.totalPages,
        },
      );

      const data = result.data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        deadline: task.deadline,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }));

      return {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        data,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.winstonLoggerService.error(
        `Erro ao listar tasks: ${error.message}`,
        error.stack,
        'ListTasksUseCase',
        { ...query, errorCode: error.code },
      );

      throw new BadRequestException('Falha ao listar tasks');
    }
  }
}
