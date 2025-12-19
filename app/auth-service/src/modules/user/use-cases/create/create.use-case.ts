import { UserRepositoryInterface } from '@modules/user/interfaces/user.repository.interface';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { randomUUID } from 'crypto';
import { CreatedUserResponseDto, CreateUserDto } from './dto/user.create.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly logger: WinstonLoggerService,
  ) {}

  async execute(input: CreateUserDto): Promise<CreatedUserResponseDto> {
    try {
      const existingUser = await this.userRepository.findByEmail(input.email);
      if (existingUser) {
        this.logger.warn(
          `Tentativa de criar usuário com email já existente: ${input.email}`,
          'CreateUserUseCase',
        );
        throw new ConflictException('Email já está em uso');
      }

      const userId = randomUUID();
      const user = await this.userRepository.create(input, userId);
      // todo gerar welcone token e enviar email de boas vindas
      this.logger.log(
        `Usuário criado com sucesso: ${user.id}`,
        'CreateUserUseCase',
        { userId: user.id, email: user.email },
      );

      return {
        email: user.email,
        id: user.id,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
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
        `Erro ao criar usuário: ${error.message}`,
        error.stack,
        'CreateUserUseCase',
        { email: input.email, errorCode: error.code },
      );

      throw new BadRequestException('Falha ao criar usuário');
    }
  }
}
