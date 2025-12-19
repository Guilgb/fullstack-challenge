import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@shared/modules/database/entities/user.entity';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum UserOrderByFields {
  EMAIL = 'email',
  USERNAME = 'username',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  ROLE = 'role',
  IS_EMAIL_VERIFIED = 'isEmailVerified',
}

export class ListUsersQueryDto {
  @ApiProperty({
    description: 'Número da página (começa em 1)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Página deve ser um número inteiro' })
  @Min(1, { message: 'Página deve ser no mínimo 1' })
  page?: number = 1;

  @ApiProperty({
    description: 'Quantidade de usuários por página (máximo 100)',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Tamanho da página deve ser um número inteiro' })
  @Min(1, { message: 'Tamanho da página deve ser no mínimo 1' })
  @Max(100, { message: 'Tamanho da página não pode ultrapassar 100' })
  pageSize?: number = 10;

  @ApiProperty({
    description: 'Campo para ordenar os resultados',
    enum: UserOrderByFields,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserOrderByFields, {
    message: `orderBy deve ser um dos valores: ${Object.values(UserOrderByFields).join(', ')}`,
  })
  orderBy?: UserOrderByFields = UserOrderByFields.CREATED_AT;

  @ApiProperty({
    description: 'Direção para ordenar os resultados',
    enum: OrderDirection,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderDirection, {
    message: `orderDirection deve ser um dos valores: ${Object.values(OrderDirection).join(', ')}`,
  })
  orderDirection?: OrderDirection = OrderDirection.DESC;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'ID único do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nome de usuário',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'Role do usuário',
    enum: UserRole,
    example: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Email verificado',
    example: false,
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Data de criação',
    example: '2025-12-19T13:50:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2025-12-19T13:50:00.000Z',
  })
  updatedAt: Date;
}

export class ListUsersResponseDto {
  @ApiProperty({
    description: 'Lista de usuários (sem senhas)',
    isArray: true,
    type: UserResponseDto,
  })
  users: UserResponseDto[];

  @ApiProperty({
    description: 'Número da página atual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Quantidade de itens por página',
    example: 10,
  })
  pageSize: number;

  @ApiProperty({
    description: 'Número total de usuários',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Número total de páginas',
    example: 3,
  })
  totalPages: number;
}
