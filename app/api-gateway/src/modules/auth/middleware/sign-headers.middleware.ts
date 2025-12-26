import { Injectable, NestMiddleware } from '@nestjs/common';
import * as crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class SignHeadersMiddleware implements NestMiddleware {
  constructor() {}

  use(req: Request, res: Response, next: NextFunction) {
    const secret = process.env.INTERNAL_SHARED_SECRET;

    if (!secret) {
      throw new Error('INTERNAL_SHARED_SECRET não configurado');
    }

    delete req.headers['x-user'];
    delete req.headers['x-user-signature'];

    const user = (req as any).user;
    if (user) {
      const payload = JSON.stringify(user);
      const signature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      req.headers['x-user'] = payload;
      req.headers['x-user-signature'] = signature;
    }

    next();
  }
}
