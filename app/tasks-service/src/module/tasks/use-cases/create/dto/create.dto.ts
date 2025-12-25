import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { priorityEnum } from '@shared/modules/database/entities/tasks.entity';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateTaskInputDto {
  @ApiProperty({ description: 'Título da tarefa' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Descrição da tarefa' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Prioridade da tarefa' })
  @IsOptional()
  @IsEnum(priorityEnum)
  priority?: priorityEnum;

  @ApiPropertyOptional({
    description: 'Prazo da tarefa',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDate()
  deadline?: Date;
}

export class CreateTaskOutputDto {
  @ApiProperty({ description: 'ID da tarefa criada' })
  id: string;

  @ApiProperty({ description: 'Título da tarefa' })
  title: string;

  @ApiPropertyOptional({ description: 'Descrição da tarefa' })
  description?: string;

  @ApiPropertyOptional({ description: 'Prioridade da tarefa' })
  priority?: priorityEnum;

  @ApiPropertyOptional({
    description: 'Prazo da tarefa',
    type: String,
    format: 'date-time',
  })
  deadline?: Date;

  @ApiProperty({
    description: 'Data de criação',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;
}
