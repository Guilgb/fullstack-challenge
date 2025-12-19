import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserModelGuard } from '../decorators/user.model.guard';
import { AuthUser } from '../interfaces/auth.interface';
import { ValidateTokenUseCase } from '../use-cases/validate-token/validate-token.use-case';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly validateTokenUseCase: ValidateTokenUseCase,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: UserModelGuard): Promise<AuthUser> {
    const user = await this.validateTokenUseCase.execute(payload);
    if (!user) {
      return null;
    }
    return user;
  }
}
