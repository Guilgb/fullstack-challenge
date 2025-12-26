import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VerifyInternalGuard } from './guards/verify-internal.guard';

@Module({
  imports: [ConfigModule],
  providers: [VerifyInternalGuard],
  exports: [VerifyInternalGuard],
})
export class AuthModule {}
