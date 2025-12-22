import {
  GatewayTimeoutException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError, timeout } from 'rxjs';

@Injectable()
export class ProxyService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProxyService.name);
  private authServiceClient: ClientProxy;

  constructor() {}

  async onModuleInit() {
    this.authServiceClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: 'auth_queue',
        queueOptions: {
          durable: true,
        },
      },
    });

    try {
      await this.authServiceClient.connect();
      this.logger.log('Conectando ao Auth Service via RabbitMQ');
    } catch (error) {
      this.logger.error('Erro na conexão com Auth Service', error);
    }
  }

  async onModuleDestroy() {
    await this.authServiceClient?.close();
  }

  async sendToAuthService<T>(
    pattern: string,
    data: unknown,
    query?: unknown,
  ): Promise<T> {
    const timeoutMs = process.env.NODE_ENV === 'production' ? 5000 : 10000;
    this.logger.debug(
      `Enviando para Auth Service — pattern: ${pattern}, timeout: ${timeoutMs}ms, data: ${JSON.stringify(data)}`,
    );

    const payload = query === undefined ? data : { data, query };

    return firstValueFrom(
      this.authServiceClient.send<T>(pattern, payload).pipe(
        timeout(timeoutMs),
        catchError((error: unknown) => {
          let errTrace: string;
          try {
            errTrace =
              error instanceof Error
                ? (error.stack ?? error.message)
                : JSON.stringify(error);
          } catch {
            errTrace = error as string;
          }

          const maybeErr = error as { name?: string; message?: unknown };
          const isTimeout =
            maybeErr?.name === 'TimeoutError' ||
            (typeof maybeErr?.message === 'string' &&
              maybeErr.message.toLowerCase().includes('timeout'));

          if (isTimeout) {
            this.logger.error(
              `Timeout no Auth Service para o padrão ${pattern}`,
              errTrace,
            );
            return throwError(
              () => new GatewayTimeoutException('Auth Service timeout'),
            );
          }

          this.logger.error(
            `Erro no serviço Auth para o padrão ${pattern}:`,
            errTrace,
          );
          return throwError(
            () =>
              new InternalServerErrorException(
                'Erro no Auth Service. Tente novamente mais tarde.',
              ),
          );
        }),
      ),
    );
  }

  emitToAuthService(pattern: string, data: unknown): void {
    this.authServiceClient.emit(pattern, data);
  }
}
