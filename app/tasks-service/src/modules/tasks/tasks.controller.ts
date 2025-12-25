import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTaskUseCase } from './use-cases/create/create.use-case';
import {
  CreateTaskInputDto,
  CreateTaskOutputDto,
} from './use-cases/create/dto/create.dto';
import { DeleteTaskUseCase } from './use-cases/delete/delete.use-case';
import { DeleteTaskParamsDto } from './use-cases/delete/dto/delete.dto';
import { GetTaskParamsDto, TaskResponseDto } from './use-cases/get/dto/get.dto';
import { GetTaskUseCase } from './use-cases/get/get.use-case';
import {
  ListTasksQueryDto,
  ListTasksReponseDto,
} from './use-cases/list/dto/list.dto';
import { ListTasksUseCase } from './use-cases/list/list.use-case';
import {
  UpdateTaskInputDto,
  UpdateTaskOutputDto,
  UpdateTaskParamsDto,
} from './use-cases/update/dto/update.task.dto';
import { UpdateTaskUseCase } from './use-cases/update/update.task.use-case';
import { http } from 'winston';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar task' })
  @ApiCreatedResponse({ type: CreateTaskOutputDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiBody({ type: CreateTaskInputDto })
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @Body() input: CreateTaskInputDto,
  ): Promise<CreateTaskOutputDto> {
    return await this.createTaskUseCase.execute(input);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tasks (paginação)' })
  @ApiOkResponse({ type: ListTasksReponseDto })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'orderBy', required: false })
  @ApiQuery({ name: 'orderDirection', required: false })
  @HttpCode(HttpStatus.OK)
  async listTasks(
    @Query() query: ListTasksQueryDto,
  ): Promise<ListTasksReponseDto> {
    return await this.listTasksUseCase.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter task por ID' })
  @ApiOkResponse({ type: TaskResponseDto })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @HttpCode(HttpStatus.OK)
  async getTask(@Param() params: GetTaskParamsDto): Promise<TaskResponseDto> {
    return await this.getTaskUseCase.execute(params);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar task' })
  @ApiOkResponse({ type: UpdateTaskOutputDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiBody({ type: UpdateTaskInputDto })
  @HttpCode(HttpStatus.OK)
  async updateTask(
    @Param() params: UpdateTaskParamsDto,
    @Body() input: UpdateTaskInputDto,
  ): Promise<UpdateTaskOutputDto> {
    return await this.updateTaskUseCase.execute(params, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover task' })
  @ApiNoContentResponse({ description: 'Task removida' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  async deleteTask(@Param() params: DeleteTaskParamsDto): Promise<void> {
    return await this.deleteTaskUseCase.execute(params);
  }
}
