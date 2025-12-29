import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class TasksResponseDto {
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

export class ListTasksBoardsQueryDto {
  @ApiProperty({ description: 'ID do board' })
  @IsUUID()
  boardId: string;

  @ApiPropertyOptional({ description: 'Página', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Tamanho da página', default: 10 })
  @IsOptional()
  pageSize?: number;
}

export class ListTasksBoardsResponseDto {
  @ApiProperty({ description: 'Lista de tasks', type: [TasksResponseDto] })
  data: TasksResponseDto[];

  @ApiProperty({ description: 'Total de tasks' })
  total: number;

  @ApiProperty({ description: 'Página atual' })
  page: number;

  @ApiProperty({ description: 'Tamanho da página' })
  pageSize: number;

  @ApiProperty({ description: 'Total de páginas' })
  totalPages: number;
}
