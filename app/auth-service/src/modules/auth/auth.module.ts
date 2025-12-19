import { UserRepositoryInterface } from '@modules/user/interfaces/user.repository.interface';
import { UserRepository } from '@modules/user/repositories/user.repository';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@shared/modules/database/entities';
import { WinstonModule } from '@shared/modules/winston/winston.module';
import { AuthController } from './auth.controller';
import { LoginUseCase } from './use-cases/login/login.use-case';

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
    { provide: UserRepositoryInterface, useClass: UserRepository },
  ],
  exports: [],
})
export class AuthModule {}
