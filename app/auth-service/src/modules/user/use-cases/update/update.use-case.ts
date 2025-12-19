import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { UserRepositoryInterface } from '../../interfaces/user.repository.interface';
import { UpdatedUserResponseDto, UpdateUserDto } from './dto/user.update.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly logger: WinstonLoggerService,
  ) {}

  async execute(
    userId: string,
    input: UpdateUserDto,
  ): Promise<UpdatedUserResponseDto> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        this.logger.warn(
          `Tentativa de atualizar usuário inexistente: ${userId}`,
          'UpdateUserUseCase',
        );
        throw new NotFoundException('Usuário não encontrado');
      }

      if (input.email && input.email !== user.email) {
        const existingUser = await this.userRepository.findByEmail(input.email);
        if (existingUser) {
          this.logger.warn(
            `Tentativa de atualizar para email já existente: ${input.email}`,
            'UpdateUserUseCase',
          );
          throw new BadRequestException('Email já está em uso');
        }
      }

      const updatedUser = await this.userRepository.update(userId, input);

      this.logger.log(
        `Usuário atualizado com sucesso: ${userId}`,
        'UpdateUserUseCase',
        { userId, email: updatedUser.email },
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
        { userId, errorCode: error.code },
      );

      throw new BadRequestException('Falha ao atualizar usuário');
    }
  }
}
