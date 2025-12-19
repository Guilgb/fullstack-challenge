import { UserRepositoryInterface } from '@modules/user/interfaces/user.repository.interface';
import { BadRequestException } from '@nestjs/common';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import { GetUserInputDto, GetUserResponseDto } from './dto/get.dto';

export class GetUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly logger: WinstonLoggerService,
  ) {}

  async execute(idOrEmail: GetUserInputDto): Promise<GetUserResponseDto> {
    this.logger.log(`Buscando usuário com ID ou email: ${idOrEmail}`);

    const user = await this.userRepository.findByIdOrEmail(idOrEmail.idOrEmail);

    if (!user) {
      this.logger.warn(`Usuário com ID ou email ${idOrEmail} não encontrado`);
      throw new BadRequestException('Usuário não encontrado');
    }

    this.logger.log(
      `Usuário com ID ou email ${idOrEmail} encontrado com sucesso`,
    );
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
