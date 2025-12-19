import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WinstonLoggerService } from '@shared/modules/winston/winston-logger.service';

import { JwtPayload } from '@modules/auth/interfaces/auth.interface';
import { TokenService } from '@modules/auth/services/token.service';
import {
  RefreshTokenDto,
  RefreshTokenResponseDto,
} from './dto/refresh-token.dto';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async execute(input: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    try {
      const storedToken = this.tokenService.getRefreshToken(
        input.refresh_token,
      );

      if (!storedToken) {
        this.logger.warn(
          `Tentativa de refresh com token inválido ou expirado`,
          'RefreshTokenUseCase',
        );
        throw new UnauthorizedException('Refresh token inválido ou expirado');
      }

      try {
        this.jwtService.verify(input.refresh_token);
      } catch (error) {
        this.logger.warn(
          `Tentativa de refresh com token inválido ou expirado`,
          'RefreshTokenUseCase',
        );
        this.tokenService.revokeRefreshToken(input.refresh_token);
        throw new UnauthorizedException(
          'Refresh token inválido ou expirado',
          error,
        );
      }

      const payload: JwtPayload = {
        sub: storedToken.userId,
        email: '',
        role: '',
      };

      const access_token = this.jwtService.sign(payload);

      const newRefreshToken = this.jwtService.sign(payload, {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });

      const refreshExpiresAt = new Date();
      refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

      this.tokenService.storeRefreshToken(
        storedToken.userId,
        newRefreshToken,
        refreshExpiresAt,
      );

      this.tokenService.revokeRefreshToken(input.refresh_token);

      this.logger.log(
        `Refresh token realizado com sucesso para usuário: ${storedToken.userId}`,
        'RefreshTokenUseCase',
        { userId: storedToken.userId },
      );

      return {
        access_token,
        refresh_token: newRefreshToken,
        token_type: 'Bearer',
        expires_in: 3600,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao fazer refresh token: ${error.message}`,
        error.stack,
        'RefreshTokenUseCase',
      );
      throw error;
    }
  }
}
