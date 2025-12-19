import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@shared/modules/database/entities/user.entity';
import { Repository } from 'typeorm';
import {
  PaginatedResult,
  PaginationOptions,
  UserRepositoryInterface,
} from '../interfaces/user.repository.interface';
import { CreateUserDto } from '../use-cases/create/dto/user.create.dto';
import { UpdateUserDto } from '../use-cases/update/dto/user.update.dto';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto, id: string): Promise<UserEntity> {
    const user = this.userRepository.create({
      id,
      ...createUserDto,
    });
    return this.userRepository.save(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async findAllPaginated(
    options: PaginationOptions,
  ): Promise<PaginatedResult<UserEntity>> {
    const {
      page,
      pageSize,
      orderBy = 'createdAt',
      orderDirection = 'DESC',
    } = options;

    const validPage = Math.max(1, page);
    const validPageSize = Math.min(Math.max(1, pageSize), 100);

    const skip = (validPage - 1) * validPageSize;

    const validOrderByFields = [
      'email',
      'username',
      'createdAt',
      'updatedAt',
      'role',
      'isEmailVerified',
    ];

    const safeOrderBy = validOrderByFields.includes(orderBy)
      ? orderBy
      : 'createdAt';

    const [data, total] = await this.userRepository.findAndCount({
      skip,
      take: validPageSize,
      order: {
        [safeOrderBy]: orderDirection,
      },
    });

    const totalPages = Math.ceil(total / validPageSize);

    return {
      data,
      total,
      page: validPage,
      pageSize: validPageSize,
      totalPages,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    await this.userRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userRepository.countBy({ email });
    return count > 0;
  }
}
