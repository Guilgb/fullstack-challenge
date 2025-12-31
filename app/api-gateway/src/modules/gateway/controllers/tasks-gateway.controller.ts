import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { SignHeadersInterceptor } from '@modules/auth/interceptors/sign-headers.interceptor';
import { AuthenticatedUser } from '@modules/auth/interfaces/auth.interface';
import { HttpService } from '@nestjs/axios';
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
  Req,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import {
  CreateTaskInputDto,
  CreateTaskOutputDto,
} from '../dto/tasks/create.task.dto';
import { DeleteTaskParamsDto } from '../dto/tasks/delete.task.dto';
import { GetTaskParamsDto, TaskResponseDto } from '../dto/tasks/get.task.dto';
import {
  ListTasksQueryDto,
  ListTasksReponseDto,
} from '../dto/tasks/list-tasks.dto';
import {
  UpdateTaskInputDto,
  UpdateTaskOutputDto,
  UpdateTaskParamsDto,
} from '../dto/tasks/update.task.dto';

@ApiTags('tasks')
@ApiBearerAuth('JWT-auth')
@UseInterceptors(SignHeadersInterceptor)
@Controller('tasks')
export class TasksGatewayController {
  constructor(private readonly httpService: HttpService) {}

  private forwardHeaders(req: Request): Record<string, string | undefined> {
    return {
      'x-user': req.headers['x-user'] as string | undefined,
      'x-user-signature': req.headers['x-user-signature'] as string | undefined,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Criar task' })
  @ApiCreatedResponse({ type: CreateTaskOutputDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiBody({ type: CreateTaskInputDto })
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createTaskDto: CreateTaskInputDto,
    @Req() req: Request,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post('/tasks', createTaskDto, {
        headers: this.forwardHeaders(req),
      }),
    );
    return response.data;
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
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListTasksQueryDto,
    @Req() req: Request,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get('/tasks', {
        params: query,
        headers: this.forwardHeaders(req),
      }),
    );
    return response.data;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter task por ID' })
  @ApiOkResponse({ type: TaskResponseDto })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  async getTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: GetTaskParamsDto,
    @Req() req: Request,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get(`/tasks/${params.id}`, {
        headers: this.forwardHeaders(req),
      }),
    );
    return response.data;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar task' })
  @ApiOkResponse({ type: UpdateTaskOutputDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiBody({ type: UpdateTaskInputDto })
  @HttpCode(HttpStatus.OK)
  async updateTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: UpdateTaskParamsDto,
    @Body() updateTaskDto: UpdateTaskInputDto,
    @Req() req: Request,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.put(`/tasks/${params.id}`, updateTaskDto, {
        headers: this.forwardHeaders(req),
      }),
    );
    return response.data;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover task' })
  @ApiNoContentResponse({ description: 'Task removida' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  async deleteTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: DeleteTaskParamsDto,
    @Req() req: Request,
  ): Promise<void> {
    await firstValueFrom(
      this.httpService.delete(`/tasks/${params.id}`, {
        headers: this.forwardHeaders(req),
      }),
    );
  }
}
