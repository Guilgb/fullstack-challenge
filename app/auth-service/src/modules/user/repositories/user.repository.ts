import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@shared/modules/database/entities/user.entity';
import { Repository } from 'typeorm';
import { UserRepositoryInterface } from '../interfaces/user.repository.interface';
import { UpdateUserDto } from '../use-cases/update/dto/user.update.dto';
import { CreateUserDto } from '../use-cases/create/dto/user.create.dto';

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
