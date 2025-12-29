import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { ProxyModule } from '../proxy/proxy.module';
import { AuthGatewayController } from './controllers/auth-gateway.controller';
import { BoardsGatewayController } from './controllers/boards-gateway.controller';
import { TasksGatewayController } from './controllers/tasks-gateway.controller';
import { UserGatewayController } from './controllers/user-gateway.controller';

@Module({
  imports: [
    ProxyModule,
    ConfigModule,
    AuthModule,
    HttpModule.register({
      baseURL: process.env.TASKS_SERVICE_URL ?? 'http://localhost:5000',
      timeout: 10000,
    }),
  ],
  controllers: [
    AuthGatewayController,
    UserGatewayController,
    TasksGatewayController,
    BoardsGatewayController,
  ],
})
export class GatewayModule {}
