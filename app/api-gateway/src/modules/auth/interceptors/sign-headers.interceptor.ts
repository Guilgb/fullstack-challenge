import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class SignHeadersInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const secret = this.configService.get<string>('INTERNAL_SHARED_SECRET');

    if (!secret) {
      throw new Error('INTERNAL_SHARED_SECRET não configurado');
    }

    delete request.headers['x-user'];
    delete request.headers['x-user-signature'];

    const user = (request as Request & { user?: unknown }).user;

    if (user) {
      const payload = JSON.stringify(user);
      const signature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      request.headers['x-user'] = payload;
      request.headers['x-user-signature'] = signature;
    }

    return next.handle();
  }
}
