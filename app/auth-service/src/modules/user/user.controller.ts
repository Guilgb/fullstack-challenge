import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
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
import { UserRepositoryInterface } from './interfaces/user.repository.interface';
import { CreateUserUseCase } from './use-cases/create/create.use-case';
import { CreateUserDto } from './use-cases/create/dto/user.create.dto';
import { ListUsersQueryDto } from './use-cases/list/dto/list.dto';
import { ListUsersUseCase } from './use-cases/list/list.use-case';
import { UpdateUserDto } from './use-cases/update/dto/user.update.dto';
import { UpdateUserUseCase } from './use-cases/update/update.use-case';

@ApiTags('Usuários')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  @Post()
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
    status: 409,
    description: 'Email já está em uso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.createUserUseCase.execute(createUserDto);
  }

  @Get()
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

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obter usuário por ID',
    description: 'Retorna os detalhes de um usuário específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário',
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
  async findById(@Param('id') id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    const { ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar usuário',
    description: 'Atualiza os dados de um usuário existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000',
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
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.updateUserUseCase.execute(id, updateUserDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletar usuário',
    description: 'Remove um usuário do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Usuário deletado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
  })
  async delete(@Param('id') id: string) {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }
}
