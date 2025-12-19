import { UserRepositoryInterface } from '@modules/user/interfaces/user.repository.interface';
import { BadRequestException, Injectable } from '@nestjs/common';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import {
  ListUsersQueryDto,
  ListUsersResponseDto,
  UserResponseDto,
} from './dto/list.dto';

@Injectable()
export class ListUsersUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly logger: WinstonLoggerService,
  ) {}

  async execute(query: ListUsersQueryDto): Promise<ListUsersResponseDto> {
    try {
      const { page = 1, pageSize = 10, orderBy, orderDirection } = query;

      const result = await this.userRepository.findAllPaginated({
        page,
        pageSize,
        orderBy,
        orderDirection,
      });

      this.logger.log(`Usuários listados com sucesso`, 'ListUsersUseCase', {
        page,
        pageSize,
        total: result.total,
        totalPages: result.totalPages,
      });

      const usersWithoutPasswords: UserResponseDto[] = result.data.map(
        user => ({
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }),
      );

      return {
        users: usersWithoutPasswords,
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `Erro ao listar usuários: ${error.message}`,
        error.stack,
        'ListUsersUseCase',
      );
      throw new BadRequestException('Falha ao listar usuários');
    }
  }
}
