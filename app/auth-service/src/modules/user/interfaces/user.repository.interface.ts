import { UserEntity } from '@shared/modules/database/entities';
import { CreateUserDto } from '../use-cases/create/dto/user.create.dto';
import { UpdateUserDto } from '../use-cases/update/dto/user.update.dto';

export interface PaginationOptions {
  page: number;
  pageSize: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export abstract class UserRepositoryInterface {
  abstract create(
    createUserDto: CreateUserDto,
    id: string,
  ): Promise<UserEntity>;
  abstract findByIdOrEmail(idOrEmail: string): Promise<UserEntity | null>;
  abstract existsByIdOrEmail(idOrEmail: string): Promise<boolean>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findAll(): Promise<UserEntity[]>;
  abstract findAllPaginated(
    options: PaginationOptions,
  ): Promise<PaginatedResult<UserEntity>>;
  abstract update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity>;
  abstract delete(id: string): Promise<boolean>;
  abstract existsByEmail(email: string): Promise<boolean>;
}
