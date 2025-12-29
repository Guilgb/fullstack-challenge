import { CurrentUser } from '@modules/auth /decorators/current-user.decorator';
import { VerifyInternalGuard } from '@modules/auth /guards/verify-internal.guard';
import { AuthenticatedUser } from '@modules/auth /interfaces/auth.interface';
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
  UseGuards,
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
import {
  RemoveMemberParamsDto,
  UpdateMemberRoleInputDto,
  UpdateMemberRoleParamsDto,
} from './dto/board.dto';
import {
  CreateBoardUseCase,
  DeleteBoardUseCase,
  GetBoardUseCase,
  ListBoardsUseCase,
  ManageMembersUseCase,
  UpdateBoardUseCase,
} from './use-cases';
import {
  CreateBoardInputDto,
  CreateBoardOutputDto,
} from './use-cases/create-board/dto/create-board.dto';
import { DeleteBoardParamsDto } from './use-cases/delete-board/dto/delete-board.dto';
import {
  BoardResponseDto,
  GetBoardParamsDto,
} from './use-cases/get-board/dto/get-board.dto';
import {
  ListBoardsQueryDto,
  ListBoardsResponseDto,
} from './use-cases/list-boards/dto/list-boards.dto';
import {
  AddMemberInputDto,
  AddMemberOutputDto,
  AddMemberParamsDto,
} from './use-cases/manage-members/dto/manage-members.dto';
import {
  UpdateBoardInputDto,
  UpdateBoardOutputDto,
  UpdateBoardParamsDto,
} from './use-cases/update-board/dto/update-board.dto';

@ApiTags('boards')
@ApiBearerAuth()
@UseGuards(VerifyInternalGuard)
@Controller('boards')
export class BoardsController {
  constructor(
    private readonly createBoardUseCase: CreateBoardUseCase,
    private readonly getBoardUseCase: GetBoardUseCase,
    private readonly listBoardsUseCase: ListBoardsUseCase,
    private readonly updateBoardUseCase: UpdateBoardUseCase,
    private readonly deleteBoardUseCase: DeleteBoardUseCase,
    private readonly manageMembersUseCase: ManageMembersUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar board' })
  @ApiCreatedResponse({ type: CreateBoardOutputDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiBody({ type: CreateBoardInputDto })
  @HttpCode(HttpStatus.CREATED)
  async createBoard(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateBoardInputDto,
  ): Promise<CreateBoardOutputDto> {
    return await this.createBoardUseCase.execute(input, user?.sub);
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
  ): Promise<ListBoardsResponseDto> {
    return await this.listBoardsUseCase.execute(query, user?.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter board por ID' })
  @ApiOkResponse({ type: BoardResponseDto })
  @ApiNotFoundResponse({ description: 'Board não encontrado' })
  @ApiParam({ name: 'id', description: 'ID do board' })
  @HttpCode(HttpStatus.OK)
  async getBoard(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: GetBoardParamsDto,
  ): Promise<BoardResponseDto> {
    return await this.getBoardUseCase.execute(params, user?.sub);
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
    @Body() input: UpdateBoardInputDto,
  ): Promise<UpdateBoardOutputDto> {
    return await this.updateBoardUseCase.execute(params, input, user?.sub);
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
  ): Promise<void> {
    return await this.deleteBoardUseCase.execute(params, user?.sub);
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
  ): Promise<AddMemberOutputDto> {
    return await this.manageMembersUseCase.addMember(params, input, user?.sub);
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
  ): Promise<void> {
    return await this.manageMembersUseCase.removeMember(params, user?.sub);
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
    @Body() input: UpdateMemberRoleInputDto,
  ): Promise<AddMemberOutputDto> {
    return await this.manageMembersUseCase.updateMemberRole(
      params,
      input,
      user?.sub,
    );
  }
}
