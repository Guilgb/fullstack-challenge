import { UserEntity } from '@shared/modules/database/entities';
import { CreateUserDto } from '../use-cases/create/dto/user.create.dto';
import { UpdateUserDto } from '../use-cases/update/dto/user.update.dto';

export abstract class UserRepositoryInterface {
  abstract create(
    createUserDto: CreateUserDto,
    id: string,
  ): Promise<UserEntity>;
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findAll(): Promise<UserEntity[]>;
  abstract update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity>;
  abstract delete(id: string): Promise<boolean>;
  abstract existsByEmail(email: string): Promise<boolean>;
}
