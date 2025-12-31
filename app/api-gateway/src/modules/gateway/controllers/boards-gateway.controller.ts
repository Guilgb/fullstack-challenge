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
  Patch,
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
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import {
  CreateBoardInputDto,
  CreateBoardOutputDto,
} from '../dto/boards/create-board.dto';
import { DeleteBoardParamsDto } from '../dto/boards/delete-board.dto';
import { RemoveMemberParamsDto } from '../dto/boards/delete-members.dto';
import {
  ListBoardsQueryDto,
  ListBoardsResponseDto,
} from '../dto/boards/list-boards.dto';
import { ListTasksBoardsResponseDto } from '../dto/boards/list-tasks-board.dto';
import {
  AddMemberInputDto,
  AddMemberOutputDto,
  AddMemberParamsDto,
} from '../dto/boards/manage-members.dto';
import {
  UpdateBoardInputDto,
  UpdateBoardOutputDto,
  UpdateBoardParamsDto,
} from '../dto/boards/update-board.dto';
import {
  UpdateMemberRoleInputDto,
  UpdateMemberRoleParamsDto,
} from '../dto/boards/update-members.dto';

@ApiTags('boards')
@ApiBearerAuth('JWT-auth')
@UseInterceptors(SignHeadersInterceptor)
@Controller('boards')
export class BoardsGatewayController {
  constructor(private readonly httpService: HttpService) {}

  private forwardHeaders(req: Request): Record<string, string | undefined> {
    return {
      'x-user': req.headers['x-user'] as string | undefined,
      'x-user-signature': req.headers['x-user-signature'] as string | undefined,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Criar board' })
  @ApiCreatedResponse({ type: CreateBoardOutputDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiBody({ type: CreateBoardInputDto })
  @HttpCode(HttpStatus.CREATED)
  async createBoard(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createBoardDto: CreateBoardInputDto,
    @Req() req: Request,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.post('/boards', createBoardDto, {
        headers: this.forwardHeaders(req),
      }),
    );
    return response.data;
  }

  @Get()
  @ApiOperation({ summary: 'Listar boards do usuário' })
  @ApiOkResponse({ type: ListBoardsResponseDto })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @HttpCode(HttpStatus.OK)
  async listBoards(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListBoardsQueryDto,
    @Req() req: Request,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get('/boards', {
        params: query,
        headers: this.forwardHeaders(req),
      }),
    );
    return response.data;
  }

  @Get(':boardId/tasks')
  @ApiOperation({ summary: 'Listar tasks do board' })
  @ApiOkResponse({ type: ListTasksBoardsResponseDto })
  @ApiNotFoundResponse({ description: 'Board não encontrado' })
  @ApiParam({ name: 'boardId', description: 'ID do board' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @HttpCode(HttpStatus.OK)
  async listBoardTasks(
    @Param('boardId') boardId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Req() req?: Request,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/boards/${boardId}/tasks`, {
        params: {
          page: page || 1,
          pageSize: pageSize || 10,
        },
        headers: req ? this.forwardHeaders(req) : {},
      }),
    );
    return response.data;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter board por ID' })
  @ApiOkResponse({ description: 'Detalhes do board' })
  @ApiNotFoundResponse({ description: 'Board não encontrado' })
  @ApiParam({ name: 'id', description: 'ID do board' })
  @HttpCode(HttpStatus.OK)
  async getBoard(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get(`/boards/${id}`, {
        headers: this.forwardHeaders(req),
      }),
    );
    return response.data;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar board' })
  @ApiOkResponse({ type: UpdateBoardOutputDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiNotFoundResponse({ description: 'Board não encontrado' })
  @ApiForbiddenResponse({ description: 'Sem permissão' })
  @ApiParam({ name: 'id', description: 'ID do board' })
  @ApiBody({ type: UpdateBoardInputDto })
  @HttpCode(HttpStatus.OK)
  async updateBoard(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: UpdateBoardParamsDto,
    @Body() updateBoardDto: UpdateBoardInputDto,
    @Req() req: Request,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.put(`/boards/${params.id}`, updateBoardDto, {
        headers: this.forwardHeaders(req),
      }),
    );
    return response.data;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover board' })
  @ApiNoContentResponse({ description: 'Board removido' })
  @ApiNotFoundResponse({ description: 'Board não encontrado' })
  @ApiForbiddenResponse({ description: 'Sem permissão' })
  @ApiParam({ name: 'id', description: 'ID do board' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBoard(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: DeleteBoardParamsDto,
    @Req() req: Request,
  ): Promise<void> {
    await firstValueFrom(
      this.httpService.delete(`/boards/${params.id}`, {
        headers: this.forwardHeaders(req),
      }),
    );
  }

  @Post(':boardId/members')
  @ApiOperation({ summary: 'Adicionar membro ao board' })
  @ApiCreatedResponse({ type: AddMemberOutputDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiNotFoundResponse({ description: 'Board não encontrado' })
  @ApiForbiddenResponse({ description: 'Sem permissão' })
  @ApiParam({ name: 'boardId', description: 'ID do board' })
  @ApiBody({ type: AddMemberInputDto })
  @HttpCode(HttpStatus.CREATED)
  async addMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: AddMemberParamsDto,
    @Body() input: AddMemberInputDto,
    @Req() req: Request,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.post(`/boards/${params.boardId}/members`, input, {
        headers: this.forwardHeaders(req),
      }),
    );
    return response.data;
  }

  @Delete(':boardId/members/:userId')
  @ApiOperation({ summary: 'Remover membro do board' })
  @ApiNoContentResponse({ description: 'Membro removido' })
  @ApiNotFoundResponse({ description: 'Board não encontrado' })
  @ApiForbiddenResponse({ description: 'Sem permissão' })
  @ApiParam({ name: 'boardId', description: 'ID do board' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: RemoveMemberParamsDto,
    @Req() req: Request,
  ): Promise<void> {
    await firstValueFrom(
      this.httpService.delete(
        `/boards/${params.boardId}/members/${params.userId}`,
        {
          headers: this.forwardHeaders(req),
        },
      ),
    );
  }

  @Patch(':boardId/members/:userId/role')
  @ApiOperation({ summary: 'Atualizar role do membro' })
  @ApiOkResponse({ type: AddMemberOutputDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiNotFoundResponse({ description: 'Board não encontrado' })
  @ApiForbiddenResponse({ description: 'Sem permissão' })
  @ApiParam({ name: 'boardId', description: 'ID do board' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiBody({ type: UpdateMemberRoleInputDto })
  @HttpCode(HttpStatus.OK)
  async updateMemberRole(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: UpdateMemberRoleParamsDto,
    @Body() updateRoleDto: UpdateMemberRoleInputDto,
    @Req() req: Request,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.patch(
        `/boards/${params.boardId}/members/${params.userId}/role`,
        updateRoleDto,
        {
          headers: this.forwardHeaders(req),
        },
      ),
    );
    return response.data;
  }
}
