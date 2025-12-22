import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { Public } from '@modules/auth/decorators/public.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';
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
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '../../auth/enums/roles.enum';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import { ProxyService } from '../../proxy/services/proxy.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { GetUserParamDto } from '../dto/get-user.dto';
import { ListUsersQueryDto } from '../dto/list-user.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserGatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar usuários com paginação',
    description: 'Retorna uma lista paginada de usuários cadastrados',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (padrão: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Quantidade de itens por página (padrão: 10, máximo: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    description: 'Campo para ordenação',
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'orderDirection',
    required: false,
    description: 'Direção da ordenação (ASC ou DESC)',
    example: 'DESC',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada de usuários retornada com sucesso',
    schema: {
      example: {
        users: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            email: 'user@example.com',
            username: 'john_doe',
            role: 'user',
            isEmailVerified: false,
            createdAt: '2025-12-19T13:50:00.000Z',
            updatedAt: '2025-12-19T13:50:00.000Z',
          },
        ],
        page: 1,
        pageSize: 10,
        total: 25,
        totalPages: 3,
      },
    },
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.proxyService.sendToAuthService('user.list', paginationDto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Pega o perfil do usuário atual' })
  @ApiResponse({ status: 200, description: 'Perfil do usuário recuperado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListUsersQueryDto,
  ) {
    return this.proxyService.sendToAuthService(
      'user.get',
      { id: user.sub },
      query,
    );
  }

  @Get(':idOrEmail')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obter usuário por ID ou email',
    description: 'Retorna os detalhes de um usuário específico',
  })
  @ApiParam({
    name: 'idOrEmail',
    description: 'ID ou email do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuário encontrado',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
  })
  async findOne(@Param() params: GetUserParamDto) {
    return this.proxyService.sendToAuthService('user.get', {
      idOrEmail: params.idOrEmail,
    });
  }

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo usuário',
    description: 'Cria um novo usuário no sistema',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuário criado com sucesso',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        username: 'john_doe',
        isEmailVerified: false,
        createdAt: '2025-12-19T13:50:00.000Z',
        updatedAt: '2025-12-19T13:50:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email já está em uso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.proxyService.sendToAuthService('user.create', createUserDto);
  }

  @Put('me')
  @ApiOperation({ summary: 'Atualizar perfil do usuário atual' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Perfil atualizado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Erro de validação',
  })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.proxyService.sendToAuthService('user.update', {
      id: user.sub,
      username: updateUserDto.username,
      email: updateUserDto.email,
      password: updateUserDto.password,
    });
  }

  @Put(':idOrEmail')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Atualizar usuário por ID ou email' })
  @ApiParam({ name: 'idOrEmail', description: 'UUID ou email do usuário' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuário atualizado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Proibido - Apenas Admin',
  })
  async update(
    @Param('idOrEmail') idOrEmail: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.proxyService.sendToAuthService('user.update', {
      idOrEmail,
      ...updateUserDto,
    });
  }

  @Delete(':idOrEmail')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir usuário por ID (Apenas Admin)' })
  @ApiParam({ name: 'idOrEmail', description: 'UUID ou email do usuário' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Usuário excluído com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Proibido - Apenas Admin',
  })
  async remove(@Param('idOrEmail') idOrEmail: string) {
    return this.proxyService.sendToAuthService('user.delete', { idOrEmail });
  }
}
