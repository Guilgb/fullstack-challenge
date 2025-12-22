import { Roles } from '@modules/auth/decorators/roles.decorator';
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
  Query,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@shared/modules/database/entities/user.entity';
import { CreateUserUseCase } from './use-cases/create/create.use-case';
import { CreateUserDto } from './use-cases/create/dto/user.create.dto';
import { DeleteUserUseCase } from './use-cases/delete/delete.use-case';
import { DeleteUserParamDto } from './use-cases/delete/dto/delete.dto';
import { GetUserParamDto } from './use-cases/get/dto/get.dto';
import { GetUserUseCase } from './use-cases/get/get.use-case';
import { ListUsersQueryDto } from './use-cases/list/dto/list.dto';
import { ListUsersUseCase } from './use-cases/list/list.use-case';
import {
  UpdateUserDto,
  UpdateUserParamDto,
} from './use-cases/update/dto/user.update.dto';
import { UpdateUserUseCase } from './use-cases/update/update.use-case';

@ApiTags('Usuários')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
  ) {}

  @Post()
  @MessagePattern('user.create')
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
        role: 'user',
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
  async create(@Body() input: CreateUserDto) {
    return this.createUserUseCase.execute(input);
  }

  @Get('list')
  @MessagePattern('user.list')
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
  async findAll(@Query() query: ListUsersQueryDto) {
    return this.listUsersUseCase.execute(query);
  }

  @Get(':idOrEmail')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @MessagePattern('user.get')
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
  async findUser(@Param() input: GetUserParamDto) {
    return this.getUserUseCase.execute(input);
  }

  @Patch(':idOrEmail')
  @MessagePattern('user.update')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar usuário',
    description: 'Atualiza os dados de um usuário existente',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuário atualizado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  async update(
    @Param() param: UpdateUserParamDto,
    @Body() input: UpdateUserDto,
  ) {
    return this.updateUserUseCase.execute(param, input);
  }

  @Delete(':idOrEmail')
  @MessagePattern('user.delete')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletar usuário',
    description: 'Remove um usuário do sistema',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Usuário deletado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
  })
  async delete(@Param() input: DeleteUserParamDto) {
    return this.deleteUserUseCase.execute(input);
  }
}
