import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { SignHeadersInterceptor } from './interceptors/sign-headers.interceptor';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [],
      useFactory: (): JwtModuleOptions => ({
        secret: process.env.JWT_SECRET_KEY,
        signOptions: {
          expiresIn: Number(process.env.JWT_EXPIRES_IN) || '1h',
        },
      }),
    }),
  ],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    SignHeadersInterceptor,
  ],
  exports: [
    JwtModule,
    PassportModule,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    SignHeadersInterceptor,
  ],
})
export class AuthModule {}
