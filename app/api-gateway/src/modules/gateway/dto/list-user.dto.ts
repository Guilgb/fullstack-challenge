import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { OrderDirection, UserOrderByFields } from './update-user.dto';

export class ListUsersQueryDto {
  @ApiProperty({
    description: 'Número da página (começa em 1)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Página deve ser um número inteiro' })
  @Min(1, { message: 'Página deve ser no mínimo 1' })
  page?: number = 1;

  @ApiProperty({
    description: 'Quantidade de usuários por página (máximo 100)',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
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
