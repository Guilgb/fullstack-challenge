import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { UserRepositoryInterface } from '../../interfaces/user.repository.interface';
import {
  UpdatedUserResponseDto,
  UpdateUserDto,
  UpdateUserParamDto,
} from './dto/user.update.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly logger: WinstonLoggerService,
  ) {}

  async execute(
    userIdOrEmail: UpdateUserParamDto,
    input: UpdateUserDto,
  ): Promise<UpdatedUserResponseDto> {
    try {
      const user = await this.userRepository.findByIdOrEmail(
        userIdOrEmail.idOrEmail,
      );
      if (!user) {
        this.logger.warn(
          `Tentativa de atualizar usuário inexistente: ${userIdOrEmail.idOrEmail}`,
          'UpdateUserUseCase',
        );
        throw new NotFoundException('Usuário não encontrado');
      }

      const updatedUser = await this.userRepository.update(
        userIdOrEmail.idOrEmail,
        input,
      );

      this.logger.log(
        `Usuário atualizado com sucesso: ${userIdOrEmail.idOrEmail}`,
        'UpdateUserUseCase',
        { userIdOrEmail: userIdOrEmail.idOrEmail, email: updatedUser.email },
      );

      return {
        email: updatedUser.email,
        id: updatedUser.id,
        isEmailVerified: updatedUser.isEmailVerified,
        role: updatedUser.role,
        username: updatedUser.username,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Erro ao atualizar usuário: ${error.message}`,
        error.stack,
        'UpdateUserUseCase',
        { userIdOrEmail: userIdOrEmail.idOrEmail, errorCode: error.code },
      );

      throw new BadRequestException('Falha ao atualizar usuário');
    }
  }
}
