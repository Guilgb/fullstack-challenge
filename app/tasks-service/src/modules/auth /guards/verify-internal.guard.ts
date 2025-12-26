import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class VerifyInternalGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const secret = process.env.INTERNAL_SHARED_SECRET;
    if (!secret) {
      throw new UnauthorizedException(
        'INTERNAL_SHARED_SECRET não configurado no serviço',
      );
    }

    const payload = request.headers['x-user'];
    const signature = request.headers['x-user-signature'];

    if (!payload || !signature) {
      throw new UnauthorizedException(
        'Headers internos ausentes. Requisição deve vir do API Gateway.',
      );
    }

    const expected = crypto
      .createHmac('sha256', secret)
      .update(String(payload))
      .digest('hex');

    if (
      !crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(String(signature)),
      )
    ) {
      throw new UnauthorizedException('Assinatura inválida dos headers');
    }

    try {
      request.user = JSON.parse(String(payload));
    } catch {
      request.user = payload;
    }

    return true;
  }
}
