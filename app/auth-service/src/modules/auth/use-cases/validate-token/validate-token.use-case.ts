import { UserModelGuard } from '@modules/auth/decorators/user.model.guard';
import { AuthUser } from '@modules/auth/interfaces/auth.interface';
import { UserRepositoryInterface } from '@modules/user/interfaces/user.repository.interface';
import { Injectable } from '@nestjs/common';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';

@Injectable()
export class ValidateTokenUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly logger: WinstonLoggerService,
  ) {}

  async execute(payload: UserModelGuard): Promise<AuthUser | null> {
    try {
      const user = await this.userRepository.findByEmail(payload.email);
      if (!user) {
        this.logger.warn(`Usuário não encontrado para email: ${payload.email}`);
        return null;
      }

      if (user.deletedAt) {
        this.logger.warn(
          `Usuário inativo tentou acessar: ${user.email}`,
          'ValidateTokenUseCase',
          {
            userId: user.id,
            email: user.email,
          },
        );
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
      };
    } catch (error) {
      this.logger.error(
        `Erro na validação do token: ${error.message}`,
        error.stack,
        'ValidateTokenUseCase',
        { email: payload.email, userId: payload.id },
      );
      return null;
    }
  }
}
