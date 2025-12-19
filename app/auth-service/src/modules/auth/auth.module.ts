import { UserRepositoryInterface } from '@modules/user/interfaces/user.repository.interface';
import { UserRepository } from '@modules/user/repositories/user.repository';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@shared/modules/database/entities';
import { WinstonModule } from '@shared/modules/winston/winston.module';
import { AuthController } from './auth.controller';
import { TokenService } from './services/token.service';
import { LoginUseCase } from './use-cases/login/login.use-case';
import { RefreshTokenUseCase } from './use-cases/refresh-token/refresh-token.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    WinstonModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule.forRoot()],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET_KEY'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RefreshTokenUseCase,
    TokenService,
    { provide: UserRepositoryInterface, useClass: UserRepository },
  ],
  exports: [],
})
export class AuthModule {}
