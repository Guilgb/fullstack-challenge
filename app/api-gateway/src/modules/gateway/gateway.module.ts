import { Module } from '@nestjs/common';
import { ProxyModule } from '../proxy/proxy.module';
import { AuthGatewayController } from './controllers/auth-gateway.controller';
import { UserGatewayController } from './controllers/user-gateway.controller';
@Module({
  imports: [ProxyModule],
  controllers: [AuthGatewayController, UserGatewayController],
})
export class GatewayModule {}
