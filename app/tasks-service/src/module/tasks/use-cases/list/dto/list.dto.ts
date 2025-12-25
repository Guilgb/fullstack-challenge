import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum TasksOrderByFields {
  TITLE = 'title',
  DESCRIPTION = 'description',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class ListTasksQueryDto {
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
    description: 'Quantidade de tasks por página (máximo 100)',
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
    enum: TasksOrderByFields,
    required: false,
  })
  @IsOptional()
  @IsEnum(TasksOrderByFields, {
    message: `orderBy deve ser um dos valores: ${Object.values(TasksOrderByFields).join(', ')}`,
  })
  orderBy?: TasksOrderByFields = TasksOrderByFields.CREATED_AT;

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

export class TasksDto {
  @ApiProperty({
    description: 'Identificador único da task',
    example: '1',
  })
  id: string;

  @ApiProperty({
    description: 'Título da task',
    example: 'Estudar NestJS',
  })
  title: string;

  @ApiProperty({
    description: 'Descrição da task',
    example: 'Ler a documentação oficial do NestJS e fazer exercícios práticos',
  })
  description: string;

  @ApiProperty({
    description: 'Prioridade da task',
    example: 'Alta',
  })
  priority: string;

  @ApiProperty({
    description: 'Data limite para conclusão da task',
    example: '2023-12-31T23:59:59Z',
  })
  deadline: Date;

  @ApiProperty({
    description: 'Data de criação da task',
    example: '2023-10-01T12:34:56Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização da task',
    example: '2023-10-02T15:20:30Z',
  })
  updatedAt: Date;
}

export class ListTasksReponseDto {
  @ApiProperty({
    description: 'Total de tasks',
    example: 50,
  })
  total: number;

  @ApiProperty({
    description: 'Número da página atual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Quantidade de tasks por página',
    example: 10,
  })
  pageSize: number;

  @ApiProperty({
    description: 'Lista de tasks',
    isArray: true,
    type: TasksDto,
  })
  data: TasksDto[];
}
