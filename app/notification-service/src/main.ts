import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'notifications_queue',
      queueOptions: {
        durable: true,
      },
      noAck: false,
    },
  });

  try {
    await app.startAllMicroservices();
    logger.log(
      '📡 Microservice RabbitMQ iniciado - Queue: notifications_queue',
    );
  } catch (err) {
    logger.error(
      '❌ Falha ao iniciar microservice RabbitMQ:',
      err instanceof Error ? err.message : err,
    );
  }

  const port = process.env.APP_PORT || 3002;
  await app.listen(port);

  logger.log(`🚀 Notification Service rodando na porta ${port}`);
  logger.log(`🔌 WebSocket endpoint: ws://localhost:${port}/notifications`);
}

bootstrap();
