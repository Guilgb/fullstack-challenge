import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'task_manager_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  try {
    await app.startAllMicroservices();
  } catch (err) {
    this.logger.error(
      '❌ Falha ao iniciar microservice do task manager:',
      err && (err as Error).message ? (err as Error).message : err,
    );
    console.error(
      'Verifique as credenciais e permissões no broker. Ex.: RABBITMQ_URL=amqp://user:pass@host:5672 ou RABBITMQ_USER/RABBITMQ_PASS.',
    );
  }

  const config = new DocumentBuilder()
    .setTitle('Task Manager Service')
    .setDescription('API para o microserviço de gerenciamento de tarefas')
    .setVersion('1.0')
    .addTag('Tarefas', 'Operações relacionadas às tarefas')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Servidor HTTP rodando na porta ${port}`);
  console.log(`📚 Documentação disponível em http://localhost:${port}/api`);
  console.log('📡 Microservice do task manager iniciado');
}

bootstrap();
