import { UserRepositoryInterface } from '@modules/user/interfaces/user.repository.interface';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '@shared/modules/database/entities';

export interface AuthenticatedRequest extends Request {
  user: UserEntity;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.userRepository.findByIdOrEmail(payload.sub);

      if (!user) {
        throw new UnauthorizedException();
      }

      request.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      return true;
    } catch {
      return false;
    }
  }
}
