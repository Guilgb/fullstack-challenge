import { UserRepositoryInterface } from '@modules/user/interfaces/user.repository.interface';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly logger: WinstonLoggerService,
  ) {}
  async execute(userIdOrEmail: string): Promise<void> {
    try {
      const userExists =
        await this.userRepository.existsByIdOrEmail(userIdOrEmail);
      if (!userExists) {
        const userByEmail =
          await this.userRepository.findByEmail(userIdOrEmail);

        if (!userByEmail) {
          this.logger.warn(
            `Tentativa de deletar usuário inexistente: ${userIdOrEmail}`,
            'DeleteUserUseCase',
          );
          throw new BadRequestException('Usuário não encontrado');
        }
      }
      await this.userRepository.delete(userIdOrEmail);
      this.logger.log(
        `Usuário deletado com sucesso: ${userIdOrEmail}`,
        'DeleteUserUseCase',
        { userIdOrEmail },
      );
    } catch (error) {
      if (error.code === '23505') {
        if (error.constraint?.includes('email')) {
          throw new ConflictException('Email já está em uso');
        }
      }

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Erro ao deletar usuário: ${error.message}`,
        error.stack,
        'DeleteUserUseCase',
        { userIdOrEmail, errorCode: error.code },
      );

      throw new BadRequestException('Falha ao deletar usuário');
    }
  }
}
