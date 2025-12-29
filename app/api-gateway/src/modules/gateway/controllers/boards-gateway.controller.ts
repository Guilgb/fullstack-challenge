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
  @ApiCreatedResponse({ description: 'Board criado com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @HttpCode(HttpStatus.CREATED)
  async createBoard(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createBoardDto: Record<string, unknown>,
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
  @ApiOkResponse({ description: 'Lista de boards' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @HttpCode(HttpStatus.OK)
  async listBoards(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: Record<string, unknown>,
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
  @ApiOkResponse({ description: 'Board atualizado' })
  @ApiNotFoundResponse({ description: 'Board não encontrado' })
  @ApiForbiddenResponse({ description: 'Sem permissão' })
  @ApiParam({ name: 'id', description: 'ID do board' })
  @HttpCode(HttpStatus.OK)
  async updateBoard(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateBoardDto: Record<string, unknown>,
    @Req() req: Request,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.put(`/boards/${id}`, updateBoardDto, {
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
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<void> {
    await firstValueFrom(
      this.httpService.delete(`/boards/${id}`, {
        headers: this.forwardHeaders(req),
      }),
    );
  }

  // Member management endpoints
  @Post(':boardId/members')
  @ApiOperation({ summary: 'Adicionar membro ao board' })
  @ApiCreatedResponse({ description: 'Membro adicionado' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiNotFoundResponse({ description: 'Board não encontrado' })
  @ApiForbiddenResponse({ description: 'Sem permissão' })
  @ApiParam({ name: 'boardId', description: 'ID do board' })
  @HttpCode(HttpStatus.CREATED)
  async addMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('boardId') boardId: string,
    @Body() addMemberDto: Record<string, unknown>,
    @Req() req: Request,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.post(`/boards/${boardId}/members`, addMemberDto, {
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
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
    @Req() req: Request,
  ): Promise<void> {
    await firstValueFrom(
      this.httpService.delete(`/boards/${boardId}/members/${userId}`, {
        headers: this.forwardHeaders(req),
      }),
    );
  }

  @Patch(':boardId/members/:userId/role')
  @ApiOperation({ summary: 'Atualizar role do membro' })
  @ApiOkResponse({ description: 'Role atualizada' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiNotFoundResponse({ description: 'Board não encontrado' })
  @ApiForbiddenResponse({ description: 'Sem permissão' })
  @ApiParam({ name: 'boardId', description: 'ID do board' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @HttpCode(HttpStatus.OK)
  async updateMemberRole(
    @CurrentUser() user: AuthenticatedUser,
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
    @Body() updateRoleDto: Record<string, unknown>,
    @Req() req: Request,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.patch(
        `/boards/${boardId}/members/${userId}/role`,
        updateRoleDto,
        {
          headers: this.forwardHeaders(req),
        },
      ),
    );
    return response.data;
  }
}
