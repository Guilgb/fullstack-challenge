import { AuthUser, JwtPayload } from '@modules/auth/interfaces/auth.interface';
import { UserRepositoryInterface } from '@modules/user/interfaces/user.repository.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../../services/token.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async execute(loginDto: LoginDto): Promise<LoginResponseDto> {
    this.logger.log(`Tentativa de login para: ${loginDto.email}`);

    try {
      const user = await this.userRepository.findByEmail(loginDto.email);
      if (!user) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        this.logger.warn(
          `Senha inválida para: ${loginDto.email}`,
          'LoginUseCase',
          { email: loginDto.email, userId: user.id },
        );
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const access_token = this.jwtService.sign(payload);

      const refresh_token = this.jwtService.sign(payload, {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });

      const refreshExpiresAt = new Date();
      refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

      this.tokenService.storeRefreshToken(
        user.id,
        refresh_token,
        refreshExpiresAt,
      );

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
      };

      this.logger.log(
        `Login realizado com sucesso para: ${user.email}`,
        'LoginUseCase',
        { userId: user.id, email: user.email },
      );

      return {
        access_token,
        refresh_token,
        token_type: 'Bearer',
        expires_in: 3600,
        user: authUser,
      };
    } catch (error) {
      this.logger.error(
        `Erro no login para ${loginDto.email}: ${error.message}`,
        error.stack,
        'LoginUseCase',
        { email: loginDto.email, error: error.message },
      );
      throw error;
    }
  }
}
