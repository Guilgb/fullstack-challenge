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
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';

@ApiTags('tasks')
@ApiBearerAuth()
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
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createTaskDto: Record<string, unknown>,
    @Req() req: Request,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.post('/tasks', createTaskDto, {
        headers: this.forwardHeaders(req),
      }),
    );
    return response.data;
  }

  @Get()
  @ApiOperation({ summary: 'Listar tasks com paginação' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'orderBy', required: false })
  @ApiQuery({ name: 'orderDirection', required: false })
  @HttpCode(HttpStatus.OK)
  async listTasks(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: Record<string, string | number | undefined>,
    @Req() req: Request,
  ): Promise<unknown> {
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
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @HttpCode(HttpStatus.OK)
  async getTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get(`/tasks/${id}`, {
        headers: this.forwardHeaders(req),
      }),
    );
    return response.data;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar task' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @HttpCode(HttpStatus.OK)
  async updateTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateTaskDto: Record<string, unknown>,
    @Req() req: Request,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.put(`/tasks/${id}`, updateTaskDto, {
        headers: this.forwardHeaders(req),
      }),
    );
    return response.data;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover task' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<void> {
    await firstValueFrom(
      this.httpService.delete(`/tasks/${id}`, {
        headers: this.forwardHeaders(req),
      }),
    );
  }
}
