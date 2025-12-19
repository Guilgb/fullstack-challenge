import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@shared/modules/database/entities/user.entity';
import { WinstonModule } from '@shared/modules/winston/winston.module';
import { UserRepositoryInterface } from './interfaces/user.repository.interface';
import { UserRepository } from './repositories/user.repository';
import { CreateUserUseCase } from './use-cases/create/create.use-case';
import { DeleteUserUseCase } from './use-cases/delete/delete.use-case';
import { GetUserUseCase } from './use-cases/get/get.use-case';
import { ListUsersUseCase } from './use-cases/list/list.use-case';
import { UpdateUserUseCase } from './use-cases/update/update.use-case';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), WinstonModule],
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    UpdateUserUseCase,
    ListUsersUseCase,
    DeleteUserUseCase,
    GetUserUseCase,
    { provide: UserRepositoryInterface, useClass: UserRepository },
  ],
  exports: [UserRepositoryInterface],
})
export class UserModule {}
