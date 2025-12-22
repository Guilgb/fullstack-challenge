import { Module } from '@nestjs/common';
import { ProxyModule } from '../proxy/proxy.module';
import { AuthGatewayController, UserGatewayController } from './controllers';

@Module({
  imports: [ProxyModule],
  controllers: [AuthGatewayController, UserGatewayController],
})
export class GatewayModule {}
