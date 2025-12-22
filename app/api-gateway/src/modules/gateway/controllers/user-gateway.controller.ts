import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '../../auth/enums/roles.enum';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import { ProxyService } from '../../proxy/services/proxy.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserGatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos os usuários (Apenas Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de usuários recuperada com sucesso',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              role: { type: 'string' },
              createdAt: { type: 'string' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Proibido - Apenas Admin',
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.proxyService.sendToAuthService('user.list', paginationDto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.proxyService.sendToAuthService('user.get', { id: user.sub });
  }

  @Get(':idOrEmail')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obter usuário por ID (Apenas Admin)' })
  @ApiParam({ name: 'idOrEmail', description: 'UUID ou email do usuário' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Usuário encontrado' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Proibido - Apenas Admin',
  })
  async findOne(@Param('idOrEmail') idOrEmail: string) {
    return this.proxyService.sendToAuthService('user.get', { idOrEmail });
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar um novo usuário (Apenas Admin)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuário criado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Erro de validação',
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email já existe' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Proibido - Apenas Admin',
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
      name: updateUserDto.name,
      email: updateUserDto.email,
      password: updateUserDto.password,
    });
  }

  @Put(':idOrEmail')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar usuário por ID (Apenas Admin)' })
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
