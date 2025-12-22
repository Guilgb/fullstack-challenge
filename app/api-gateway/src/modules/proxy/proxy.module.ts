import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProxyService } from './services/proxy.service';

@Module({
  imports: [ConfigModule],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule {}
